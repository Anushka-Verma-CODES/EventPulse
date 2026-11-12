
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';

import { Event } from '../events/entities/event.entity';
import { EventGate } from './entities/event-gate.entity';
import { Registration } from '../registrations/entities/registration.entity';

import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';

import { CreateGateDto } from './dto/create-gate.dto';
import { UpdateGateDto } from './dto/update-gate.dto';

@Injectable()
export class GatesService {
  constructor(
    @InjectRepository(EventGate)
    private readonly gateRepository: Repository<EventGate>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,

    private readonly usersService: UsersService,
  ) {}

  private async validateOrganizer(
    organizerId: string,
    eventId: string,
  ): Promise<Event> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Only organizers can manage event gates.',
      );
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only manage gates for your own events.',
      );
    }

    return event;
  }

  async createGate(
    organizerId: string,
    eventId: string,
    dto: CreateGateDto,
  ): Promise<EventGate> {
    await this.validateOrganizer(organizerId, eventId);

    const code = dto.code.trim().toUpperCase();

    const existingGate = await this.gateRepository.findOne({
      where: {
        eventId,
        code,
      },
    });

    if (existingGate) {
      throw new ConflictException(
        'A gate with this code already exists for this event.',
      );
    }

    const gate = this.gateRepository.create({
      eventId,
      name: dto.name.trim(),
      code,
      capacity: dto.capacity ?? null,
      isActive: true,
    });

    return this.gateRepository.save(gate);
  }

  async getEventGates(
    organizerId: string,
    eventId: string,
  ): Promise<EventGate[]> {
    await this.validateOrganizer(organizerId, eventId);

    return this.gateRepository.find({
      where: { eventId },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async getGate(
    organizerId: string,
    gateId: string,
  ): Promise<EventGate> {
    const gate = await this.gateRepository.findOne({
      where: { id: gateId },
    });

    if (!gate) {
      throw new NotFoundException('Gate not found.');
    }

    await this.validateOrganizer(organizerId, gate.eventId);

    return gate;
  }

  async updateGate(
    organizerId: string,
    gateId: string,
    dto: UpdateGateDto,
  ): Promise<EventGate> {
    const gate = await this.getGate(organizerId, gateId);

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();

      const existingGate = await this.gateRepository.findOne({
        where: {
          eventId: gate.eventId,
          code,
        },
      });

      if (existingGate && existingGate.id !== gate.id) {
        throw new ConflictException(
          'A gate with this code already exists for this event.',
        );
      }

      gate.code = code;
    }

    if (dto.name !== undefined) {
      gate.name = dto.name.trim();
    }

    if (dto.capacity !== undefined) {
      gate.capacity = dto.capacity;
    }

    if (dto.isActive !== undefined) {
      gate.isActive = dto.isActive;
    }

    return this.gateRepository.save(gate);
  }

  async deactivateGate(
    organizerId: string,
    gateId: string,
  ): Promise<{ message: string }> {
    const gate = await this.getGate(organizerId, gateId);

    if (!gate.isActive) {
      throw new BadRequestException(
        'This gate is already inactive.',
      );
    }

    gate.isActive = false;

    await this.gateRepository.save(gate);

    return {
      message: 'Gate deactivated successfully.',
    };
  }

  // Gate Traffic Prediction
  async getGateTrafficPredictions(
    organizerId: string,
    eventId: string,
  ) {
    const event = await this.validateOrganizer(
      organizerId,
      eventId,
    );

    const now = new Date();
    const windowSize = 5 * 60 * 1000;

    const currentWindowStart = new Date(
      now.getTime() - windowSize,
    );

    const previousWindowStart = new Date(
      now.getTime() - windowSize * 2,
    );

    const thirdWindowStart = new Date(
      now.getTime() - windowSize * 3,
    );

    const gates = await this.gateRepository.find({
      where: { eventId },
      order: { createdAt: 'ASC' },
    });

    const predictions = await Promise.all(
      gates.map(async (gate) => {
        const currentCount =
          await this.registrationRepository.count({
            where: {
              eventId,
              checkedInGateId: gate.id,
              isCheckedIn: true,
              checkedInAt: MoreThanOrEqual(
                currentWindowStart,
              ),
            },
          });

        const previousCount =
          await this.registrationRepository.count({
            where: {
              eventId,
              checkedInGateId: gate.id,
              isCheckedIn: true,
              checkedInAt: MoreThanOrEqual(
                previousWindowStart,
              ),
              // Exclude the latest 5-minute window.
              // Applied below through a query builder.
            },
          });

        const previousWindowCount =
          await this.registrationRepository
            .createQueryBuilder('registration')
            .where('registration.eventId = :eventId', {
              eventId,
            })
            .andWhere(
              'registration.checkedInGateId = :gateId',
              { gateId: gate.id },
            )
            .andWhere('registration.isCheckedIn = true')
            .andWhere(
              'registration.checkedInAt >= :start',
              { start: previousWindowStart },
            )
            .andWhere(
              'registration.checkedInAt < :end',
              { end: currentWindowStart },
            )
            .getCount();

        const thirdWindowCount =
          await this.registrationRepository
            .createQueryBuilder('registration')
            .where('registration.eventId = :eventId', {
              eventId,
            })
            .andWhere(
              'registration.checkedInGateId = :gateId',
              { gateId: gate.id },
            )
            .andWhere('registration.isCheckedIn = true')
            .andWhere(
              'registration.checkedInAt >= :start',
              { start: thirdWindowStart },
            )
            .andWhere(
              'registration.checkedInAt < :end',
              { end: previousWindowStart },
            )
            .getCount();

        const predictedCount = Math.round(
          currentCount * 0.5 +
          previousWindowCount * 0.3 +
          thirdWindowCount * 0.2,
        );

        let trafficLevel = 'Normal';

        if (predictedCount > event.highMax) {
          trafficLevel = 'Very High';
        } else if (predictedCount > event.moderateMax) {
          trafficLevel = 'High';
        } else if (predictedCount > event.normalMax) {
          trafficLevel = 'Moderate';
        }

        let recommendation = 'Traffic is normal. Continue monitoring.';

        if (trafficLevel === 'Very High') {
          recommendation =
            'Very high traffic predicted. Consider redirecting attendees to another staffed gate.';
        } else if (trafficLevel === 'High') {
          recommendation =
            'High traffic predicted. Prepare additional entry support if available.';
        } else if (trafficLevel === 'Moderate') {
          recommendation =
            'Moderate traffic predicted. Monitor this gate closely.';
        }

        return {
          gateId: gate.id,
          gateName: gate.name,
          gateCode: gate.code,
          isActive: gate.isActive,

          currentWindow: {
            entries: currentCount,
            start: currentWindowStart,
            end: now,
          },

          previousWindow: {
            entries: previousWindowCount,
          },

          thirdWindow: {
            entries: thirdWindowCount,
          },

          predictedEntries: predictedCount,
          trafficLevel,
          recommendation,
        };
      }),
    );

    const activePredictions = predictions.filter(
      (prediction) => prediction.isActive,
    );

    return {
      eventId: event.id,
      eventTitle: event.title,

      monitoringWindowMinutes: 5,

      thresholds: {
        normalMax: event.normalMax,
        moderateMax: event.moderateMax,
        highMax: event.highMax,
      },

      generatedAt: now,

      totalCurrentEntries: predictions.reduce(
        (total, prediction) =>
          total + prediction.currentWindow.entries,
        0,
      ),

      totalPredictedEntries: predictions.reduce(
        (total, prediction) =>
          total + prediction.predictedEntries,
        0,
      ),

      gates: predictions,

      activeGates: activePredictions.length,
    };
  }
}

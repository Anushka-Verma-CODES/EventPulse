
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event, EventStatus } from '../events/entities/event.entity';
import { EventGate } from './entities/event-gate.entity';
import { Registration } from '../registrations/entities/registration.entity';

@Injectable()
export class LiveEntryStatusService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(EventGate)
    private readonly gateRepository: Repository<EventGate>,

    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
  ) {}

  async getEventStatus(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: {
        id: eventId,
        status: EventStatus.PUBLISHED,
      },
    });

    if (!event) {
      throw new NotFoundException('Published event not found.');
    }

    const generatedAt = new Date();
    const windowMinutes = 5;

    const windowStart = new Date(
      generatedAt.getTime() - windowMinutes * 60 * 1000,
    );

    const gates = await this.gateRepository.find({
      where: {
        eventId,
        isActive: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const gateStatuses = await Promise.all(
      gates.map(async (gate) => {
        const entries = await this.registrationRepository
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
            'registration.checkedInAt >= :windowStart',
            { windowStart },
          )
          .andWhere(
            'registration.checkedInAt <= :generatedAt',
            { generatedAt },
          )
          .getCount();

        let trafficLevel = 'Normal';

        if (entries > event.highMax) {
          trafficLevel = 'Very High';
        } else if (entries > event.moderateMax) {
          trafficLevel = 'High';
        } else if (entries > event.normalMax) {
          trafficLevel = 'Moderate';
        }

        return {
          gateId: gate.id,
          gateName: gate.name,
          gateCode: gate.code,
          entries,
          scansPerMinute: Number(
            (entries / windowMinutes).toFixed(1),
          ),
          trafficLevel,
        };
      }),
    );

    const recommendedGate = [...gateStatuses].sort(
      (a, b) => a.entries - b.entries,
    )[0];

    return {
      eventId: event.id,
      eventName: event.title,
      monitoringWindowMinutes: windowMinutes,
      generatedAt,
      totalEntries: gateStatuses.reduce(
        (total, gate) => total + gate.entries,
        0,
      ),
      recommendedGate: recommendedGate
        ? {
            gateId: recommendedGate.gateId,
            gateName: recommendedGate.gateName,
          }
        : null,
      gates: gateStatuses,
    };
  }
}

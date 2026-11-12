
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from '../events/entities/event.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { UpdateGateThresholdsDto } from './dto/update-gate-thresholds.dto';

@Injectable()
export class GateThresholdsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    private readonly usersService: UsersService,
  ) {}

  private async validateOrganizer(organizerId: string) {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Only organizers can manage gate traffic thresholds.',
      );
    }
  }

  async getThresholds(organizerId: string, eventId: string) {
    await this.validateOrganizer(organizerId);

    const event = await this.eventRepository.findOne({
      where: {
        id: eventId,
        organizerId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    return {
      eventId: event.id,
      eventName: event.title,
      monitoringWindowMinutes: 5,
      normalMax: event.normalMax,
      moderateMax: event.moderateMax,
      highMax: event.highMax,
    };
  }

  async updateThresholds(
    organizerId: string,
    eventId: string,
    dto: UpdateGateThresholdsDto,
  ) {
    await this.validateOrganizer(organizerId);

    if (
      dto.normalMax >= dto.moderateMax ||
      dto.moderateMax >= dto.highMax
    ) {
      throw new BadRequestException(
        'Thresholds must be in increasing order: normalMax < moderateMax < highMax.',
      );
    }

    const event = await this.eventRepository.findOne({
      where: {
        id: eventId,
        organizerId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    event.normalMax = dto.normalMax;
    event.moderateMax = dto.moderateMax;
    event.highMax = dto.highMax;

    const updatedEvent = await this.eventRepository.save(event);

    return {
      message: 'Gate traffic thresholds updated successfully.',
      eventId: updatedEvent.id,
      monitoringWindowMinutes: 5,
      normalMax: updatedEvent.normalMax,
      moderateMax: updatedEvent.moderateMax,
      highMax: updatedEvent.highMax,
    };
  }
}

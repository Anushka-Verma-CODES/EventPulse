
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event, EventStatus } from "../events/entities/event.entity";
import { Registration } from "./entities/registration.entity";

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async register(attendeeId: string, eventId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        "You can only register for published events",
      );
    }

    const existingRegistration =
      await this.registrationsRepository.findOne({
        where: { attendeeId, eventId },
      });

    if (existingRegistration) {
      throw new ConflictException(
        "You are already registered for this event",
      );
    }

    const registrationCount = await this.registrationsRepository.count({
      where: { eventId },
    });

    if (registrationCount >= event.capacity) {
      throw new BadRequestException("This event is full");
    }

    const registration = this.registrationsRepository.create({
      attendeeId,
      eventId,
    });

    try {
      return await this.registrationsRepository.save(registration);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ConflictException(
          "You are already registered for this event",
        );
      }

      throw error;
    }
  }

  async getMyRegistrations(attendeeId: string) {
    return this.registrationsRepository.find({
      where: { attendeeId },
      relations: { event: true },
      order: { registeredAt: "DESC" },
    });
  }
}

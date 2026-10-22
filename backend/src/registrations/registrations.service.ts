import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomBytes } from "node:crypto";
import { IsNull, Repository } from "typeorm";
import { Event, EventStatus } from "../events/entities/event.entity";
import { Registration } from "./entities/registration.entity";
import { User } from "../users/entities/user.entity";
import { ScannerEventAssignment } from '../volunteers/entities/scanner-event-assignment.entity';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,

    @InjectRepository(ScannerEventAssignment)
    private readonly scannerEventAssignmentRepository: Repository<ScannerEventAssignment>,
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

    if (Number(event.price) > 0) {
      throw new BadRequestException(
        "Paid events require payment verification.",
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
      qrToken: randomBytes(32).toString("hex"),
      isCheckedIn: false,
      checkedInAt: null,
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

  
async getOrganizerAttendees(organizerId: string) {
  const registrations = await this.registrationsRepository
    .createQueryBuilder("registration")
    .innerJoin("registration.event", "event")
    .innerJoin(User, "attendee", "attendee.id = registration.attendeeId")
    .select("registration.id", "registrationId")
    .addSelect("registration.attendeeId", "attendeeId")
    .addSelect("attendee.fullName", "name")
    .addSelect("attendee.email", "email")
    .addSelect("event.title", "eventName")
    .addSelect("registration.registeredAt", "registeredAt")
    .addSelect("registration.isCheckedIn", "isCheckedIn")
    .addSelect("registration.checkedInAt", "checkedInAt")
    .where("event.organizerId = :organizerId", { organizerId })
    .orderBy("registration.registeredAt", "DESC")
    .getRawMany();

  return registrations.map((registration) => ({
    id: registration.registrationId,
    attendeeId: registration.attendeeId,
    name: registration.name,
    email: registration.email,
    ticket: registration.registrationId.slice(0, 8).toUpperCase(),
    eventName: registration.eventName,
    registeredOn: registration.registeredAt,
    status: registration.isCheckedIn ? "Checked In" : "Not Checked In",
    checkedInAt: registration.checkedInAt,
    gate: "—",
  }));
}

    async getOrganizerDashboardStats(organizerId: string) {
    const events = await this.eventsRepository.find({
      where: { organizerId },
      order: { startDate: "ASC" },
    });

    const eventIds = events.map((event) => event.id);

    if (eventIds.length === 0) {
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        totalRegistrations: 0,
        totalCheckIns: 0,
        upcomingEventsList: [],
        weeklyAttendance: [],
        recentActivity: [],
      };
    }

    const registrations = await this.registrationsRepository
      .createQueryBuilder("registration")
      .innerJoinAndSelect("registration.event", "event")
      .where("registration.eventId IN (:...eventIds)", { eventIds })
      .orderBy("registration.registeredAt", "DESC")
      .getMany();

    const now = new Date();

    const upcomingEvents = events.filter(
      (event) =>
        event.startDate >= now &&
        event.status === EventStatus.PUBLISHED,
    );

    const totalCheckIns = registrations.filter(
      (registration) => registration.isCheckedIn,
    ).length;

    const weeklyAttendance = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const value = registrations.filter((registration) => {
          if (!registration.checkedInAt) {
            return false;
          }

          const checkedInAt = new Date(registration.checkedInAt);

          return checkedInAt >= date && checkedInAt < nextDate;
        }).length;

        return {
          day: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          value,
        };
      },
    );

    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      totalRegistrations: registrations.length,
      totalCheckIns,
      upcomingEventsList: upcomingEvents.slice(0, 5).map((event) => ({
        id: event.id,
        name: event.title,
        date: event.startDate,
        venue: event.location,
        registered: registrations.filter(
          (registration) => registration.eventId === event.id,
        ).length,
      })),
      weeklyAttendance,
      recentActivity: registrations.slice(0, 5).map((registration) => ({
        id: registration.id,
        text: registration.isCheckedIn
          ? "Ticket checked in"
          : "New registration",
        context: registration.event.title,
        date: registration.isCheckedIn
          ? registration.checkedInAt
          : registration.registeredAt,
      })),
    };
  }

  
  async getOrganizerEventRegistrationCounts(organizerId: string) {
    const counts = await this.registrationsRepository
      .createQueryBuilder("registration")
      .innerJoin("registration.event", "event")
      .select("registration.eventId", "eventId")
      .addSelect("COUNT(registration.id)", "count")
      .where("event.organizerId = :organizerId", { organizerId })
      .groupBy("registration.eventId")
      .getRawMany<{ eventId: string; count: string }>();

    return counts.map((item) => ({
      eventId: item.eventId,
      count: Number(item.count),
    }));
  }


  async generateMissingQrTokens() {
    const registrations = await this.registrationsRepository.find({
      where: { qrToken: IsNull() },
    });

    let updatedCount = 0;

    for (const registration of registrations) {
      registration.qrToken = randomBytes(32).toString("hex");
      await this.registrationsRepository.save(registration);
      updatedCount++;
    }

    return {
      message: "Missing QR tokens generated successfully",
      updatedCount,
    };
  }

  async checkIn(
  qrToken: string,
  eventId: string,
  scannerUserId: string,
) {
  if (!qrToken || typeof qrToken !== "string") {
    throw new BadRequestException("QR token is required");
  }

  if (!eventId || !scannerUserId) {
    throw new BadRequestException(
      "Event ID and scanner user ID are required",
    );
  }

  const scannerAssignment =
    await this.scannerEventAssignmentRepository.findOne({
      where: {
        eventId,
        scannerUserId,
        isActive: true,
      },
    });

  if (!scannerAssignment) {
    throw new ForbiddenException(
      "You do not have scanner access for this event.",
    );
  }

  const registration = await this.registrationsRepository.findOne({
    where: { qrToken },
    relations: { event: true },
  });

  if (!registration) {
    throw new NotFoundException("Invalid ticket QR code");
  }

  if (registration.eventId !== eventId) {
    throw new BadRequestException(
      "This ticket does not belong to the selected event.",
    );
  }

  if (registration.isCheckedIn) {
    throw new ConflictException("This ticket has already been used");
  }

  registration.isCheckedIn = true;
  registration.checkedInAt = new Date();

  await this.registrationsRepository.save(registration);

  return {
    message: "Check-in successful",
    registrationId: registration.id,
    eventId: registration.eventId,
    eventName: registration.event.title,
    checkedInAt: registration.checkedInAt,
  };
}

}

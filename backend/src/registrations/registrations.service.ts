
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
import { ScannerEventAssignment } from "../volunteers/entities/scanner-event-assignment.entity";
import { ScanAttempt } from "./entities/scan-attempt.entity";

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,

    @InjectRepository(ScannerEventAssignment)
    private readonly scannerEventAssignmentRepository: Repository<ScannerEventAssignment>,

    @InjectRepository(ScanAttempt)
    private readonly scanAttemptRepository: Repository<ScanAttempt>,
  ) {}

  private async recordScanAttempt(
    scannerUserId: string,
    eventId: string | null,
    result: string,
    message: string,
    registrationId: string | null = null,
  ): Promise<void> {
    try {
      await this.scanAttemptRepository.save({
        scannerUserId,
        eventId,
        registrationId,
        result,
        message,
      });
    } catch (error) {
      console.error("Failed to record scan attempt:", error);
    }
  }

  async register(attendeeId: string, eventId: string) {
    try {
      return await this.registrationsRepository.manager.transaction(
        async (manager) => {
          const event = await manager.findOne(Event, {
            where: { id: eventId },
            lock: { mode: "pessimistic_write" },
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

          const existingRegistration = await manager.findOne(Registration, {
            where: { attendeeId, eventId },
          });

          if (existingRegistration) {
            throw new ConflictException(
              "You are already registered for this event",
            );
          }

          const registrationCount = await manager.count(Registration, {
            where: { eventId },
          });

          if (registrationCount >= event.capacity) {
            throw new BadRequestException("This event is full");
          }

          const registration = manager.create(Registration, {
            attendeeId,
            eventId,
            qrToken: randomBytes(32).toString("hex"),
            isCheckedIn: false,
            checkedInAt: null,
            checkedInGateId: null,
          });

          return await manager.save(Registration, registration);
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
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
      relations: {
        event: true,
        checkedInGate: true,
      },
      order: { registeredAt: "DESC" },
    });
  }

  async getOrganizerAttendees(organizerId: string) {
    const registrations = await this.registrationsRepository
      .createQueryBuilder("registration")
      .innerJoin("registration.event", "event")
      .innerJoin(User, "attendee", "attendee.id = registration.attendeeId")
      .leftJoin("registration.checkedInGate", "gate")
      .select("registration.id", "registrationId")
      .addSelect("registration.attendeeId", "attendeeId")
      .addSelect("registration.eventId", "eventId")
      .addSelect("attendee.fullName", "name")
      .addSelect("attendee.email", "email")
      .addSelect("event.title", "eventName")
      .addSelect("registration.registeredAt", "registeredAt")
      .addSelect("registration.isCheckedIn", "isCheckedIn")
      .addSelect("registration.checkedInAt", "checkedInAt")
      .addSelect("registration.checkedInGateId", "checkedInGateId")
      .addSelect("gate.name", "gateName")
      .where("event.organizerId = :organizerId", { organizerId })
      .orderBy("registration.registeredAt", "DESC")
      .getRawMany();

    return registrations.map((registration) => ({
      id: registration.registrationId,
      attendeeId: registration.attendeeId,
      eventId: registration.eventId,
      name: registration.name,
      email: registration.email,
      ticket: registration.registrationId.slice(0, 8).toUpperCase(),
      eventName: registration.eventName,
      registeredOn: registration.registeredAt,
      status: registration.isCheckedIn
        ? "Checked In"
        : "Not Checked In",
      checkedInAt: registration.checkedInAt,
      checkedInGateId: registration.checkedInGateId,
      gate: registration.gateName ?? "—",
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
        event.startDate >= now && event.status === EventStatus.PUBLISHED,
    );

    const totalCheckIns = registrations.filter(
      (registration) => registration.isCheckedIn,
    ).length;

    const weeklyAttendance = Array.from({ length: 7 }, (_, index) => {
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
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        value,
      };
    });

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
    ticketIdentifier: string,
    eventId: string,
    scannerUserId: string,
  ) {
    if (
      !ticketIdentifier ||
      typeof ticketIdentifier !== "string"
    ) {
      throw new BadRequestException(
        "Ticket ID or QR token is required",
      );
    }

    if (!eventId || !scannerUserId) {
      throw new BadRequestException(
        "Event ID and scanner user ID are required",
      );
    }

    const isTicketId = /^EP-[A-F0-9]{8}$/i.test(
      ticketIdentifier.trim(),
    );

    const isQrToken = /^[A-F0-9]{64}$/i.test(
      ticketIdentifier.trim(),
    );

    if (!isTicketId && !isQrToken) {
      throw new BadRequestException(
        "Invalid Ticket ID or QR token format",
      );
    }

    const scannerAssignment =
      await this.scannerEventAssignmentRepository.findOne({
        where: {
          eventId,
          scannerUserId,
          isActive: true,
        },
        relations: {
          gate: true,
        },
      });

    if (!scannerAssignment) {
      throw new ForbiddenException(
        "You do not have scanner access for this event.",
      );
    }

    const now = new Date();

    if (
      !scannerAssignment.startsAt ||
      !scannerAssignment.endsAt ||
      now < new Date(scannerAssignment.startsAt) ||
      now > new Date(scannerAssignment.endsAt)
    ) {
      throw new ForbiddenException(
        "Scanner access is not active at the current date and time.",
      );
    }

    const assignedGate = scannerAssignment.gate;

    if (!assignedGate || !assignedGate.isActive) {
      throw new ForbiddenException(
        "Your assigned gate is no longer active.",
      );
    }

    const registrationQuery =
      this.registrationsRepository
        .createQueryBuilder("registration")
        .leftJoinAndSelect("registration.event", "event");

    if (isTicketId) {
      const registrationPrefix = ticketIdentifier
        .trim()
        .substring(3)
        .toLowerCase();

      registrationQuery.where(
        "LOWER(CAST(registration.id AS text)) LIKE :ticketPrefix",
        {
          ticketPrefix: `${registrationPrefix}%`,
        },
      );
    } else {
      registrationQuery.where(
        "registration.qrToken = :qrToken",
        {
          qrToken: ticketIdentifier.trim(),
        },
      );
    }

    const registration = await registrationQuery.getOne();

    if (!registration) {
      await this.recordScanAttempt(
        scannerUserId,
        eventId,
        "invalid",
        "Invalid Ticket ID or QR code",
      );

      throw new NotFoundException(
        "Invalid Ticket ID or QR code",
      );
    }

    if (registration.eventId !== eventId) {
      await this.recordScanAttempt(
        scannerUserId,
        eventId,
        "wrong_event",
        "This ticket does not belong to the selected event.",
        registration.id,
      );

      throw new BadRequestException(
        "This ticket does not belong to the selected event.",
      );
    }

    const checkedInAt = new Date();

    const result = await this.registrationsRepository
      .createQueryBuilder()
      .update(Registration)
      .set({
        isCheckedIn: true,
        checkedInAt,
        checkedInGateId: assignedGate.id,
      })
      .where('"id" = :id AND "isCheckedIn" = false', {
        id: registration.id,
      })
      .execute();

    if (result.affected === 0) {
      await this.recordScanAttempt(
        scannerUserId,
        eventId,
        "duplicate",
        "This ticket has already been used",
        registration.id,
      );

      throw new ConflictException(
        "This ticket has already been used",
      );
    }

    await this.recordScanAttempt(
      scannerUserId,
      eventId,
      "valid",
      "Check-in successful",
      registration.id,
    );

    return {
      message: "Check-in successful",
      registrationId: registration.id,
      ticketId: `EP-${registration.id
        .slice(0, 8)
        .toUpperCase()}`,
      eventId: registration.eventId,
      eventName: registration.event.title,
      checkedInAt,
      gateId: assignedGate.id,
      gateName: assignedGate.name,
    };
  }

  async getScannerScanHistory(scannerUserId: string) {
    const assignments = await this.scannerEventAssignmentRepository.find({
      where: {
        scannerUserId,
        isActive: true,
      },
      select: {
        eventId: true,
      },
    });

    const eventIds = [...new Set(assignments.map((item) => item.eventId))];

    if (eventIds.length === 0) {
      return [];
    }

    const registrations = await this.registrationsRepository
      .createQueryBuilder("registration")
      .innerJoin("registration.event", "event")
      .innerJoin(User, "attendee", "attendee.id = registration.attendeeId")
      .leftJoin("registration.checkedInGate", "gate")
      .select("registration.id", "registrationId")
      .addSelect("registration.eventId", "eventId")
      .addSelect("registration.attendeeId", "attendeeId")
      .addSelect("attendee.fullName", "attendeeName")
      .addSelect("event.title", "eventName")
      .addSelect("registration.checkedInAt", "checkedInAt")
      .addSelect("registration.checkedInGateId", "gateId")
      .addSelect("gate.name", "gateName")
      .where("registration.eventId IN (:...eventIds)", { eventIds })
      .andWhere("registration.isCheckedIn = :isCheckedIn", {
        isCheckedIn: true,
      })
      .orderBy("registration.checkedInAt", "DESC")
      .getRawMany();

    const successfulScans = registrations.map((registration) => ({
      id: registration.registrationId,
      registrationId: registration.registrationId,
      eventId: registration.eventId,
      attendeeId: registration.attendeeId,
      attendeeName: registration.attendeeName,
      eventName: registration.eventName,
      ticketId: registration.registrationId.slice(0, 8).toUpperCase(),
      checkedInAt: registration.checkedInAt,
      scannedAt: registration.checkedInAt,
      gateId: registration.gateId,
      gateName: registration.gateName ?? "Unknown gate",
      result: "valid",
      message: "Check-in successful",
    }));

    const rejectedScans = await this.scanAttemptRepository
      .createQueryBuilder("scan")
      .leftJoin(
        Event,
        "event",
        "event.id = scan.eventId",
      )
      .leftJoin(
        Registration,
        "registration",
        "registration.id = scan.registrationId",
      )
      .leftJoin(
        User,
        "attendee",
        "attendee.id = registration.attendeeId",
      )
      .select("scan.id", "id")
      .addSelect("scan.registrationId", "registrationId")
      .addSelect("scan.eventId", "eventId")
      .addSelect("attendee.id", "attendeeId")
      .addSelect("attendee.fullName", "attendeeName")
      .addSelect("event.title", "eventName")
      .addSelect("scan.scannedAt", "scannedAt")
      .addSelect("scan.result", "result")
      .addSelect("scan.message", "message")
      .where("scan.scannerUserId = :scannerUserId", { scannerUserId })
      .andWhere("scan.result <> :valid", { valid: "valid" })
      .orderBy("scan.scannedAt", "DESC")
      .getRawMany();

    const formattedRejectedScans = rejectedScans.map((scan) => ({
      id: scan.id,
      registrationId: scan.registrationId ?? null,
      eventId: scan.eventId ?? null,
      attendeeId: scan.attendeeId ?? null,
      attendeeName: scan.attendeeName ?? "Unknown attendee",
      eventName: scan.eventName ?? "Unknown event",
      ticketId: scan.registrationId
        ? scan.registrationId.slice(0, 8).toUpperCase()
        : "Unknown ticket",
      checkedInAt: null,
      scannedAt: scan.scannedAt,
      gateId: null,
      gateName: null,
      result: scan.result,
      message: scan.message,
    }));

    return [...successfulScans, ...formattedRejectedScans].sort(
      (a, b) =>
        new Date(b.scannedAt).getTime() -
        new Date(a.scannedAt).getTime(),
    );
  }
}


import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../events/entities/event.entity";
import { Registration } from "../registrations/entities/registration.entity";
import {
  Incident,
  IncidentStatus,
} from "./entities/incident.entity";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { UpdateIncidentDto } from "./dto/update-incident.dto";

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentsRepository: Repository<Incident>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,

    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
  ) {}

  async findAll(organizerId: string, eventId?: string) {
    const query = this.incidentsRepository
      .createQueryBuilder("incident")
      .leftJoinAndSelect("incident.event", "event")
      .leftJoinAndSelect("incident.reportedBy", "reporter")
      .where("incident.organizerId = :organizerId", {
        organizerId,
      });

    if (eventId) {
      query.andWhere("incident.eventId = :eventId", { eventId });
    }

    return query
      .orderBy("incident.createdAt", "DESC")
      .getMany();
  }

  async create(attendeeId: string, dto: CreateIncidentDto) {
    const event = await this.eventsRepository.findOne({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    const registration = await this.registrationsRepository.findOne({
      where: {
        attendeeId,
        eventId: event.id,
      },
    });

    if (!registration) {
      throw new ForbiddenException(
        "You must be registered for this event to report an incident",
      );
    }

    const incident = this.incidentsRepository.create({
      eventId: event.id,
      organizerId: event.organizerId,
      reportedById: attendeeId,
      title: dto.title.trim(),
      description: dto.description.trim(),
      severity: dto.severity,
      location: dto.location?.trim() || null,
    });

    return this.incidentsRepository.save(incident);
  }

  async update(
    organizerId: string,
    incidentId: string,
    dto: UpdateIncidentDto,
  ) {
    const incident = await this.findOwnedIncident(
      organizerId,
      incidentId,
    );

    if (dto.title !== undefined) {
      incident.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      incident.description = dto.description.trim();
    }

    if (dto.severity !== undefined) {
      incident.severity = dto.severity;
    }

    if (dto.location !== undefined) {
      incident.location = dto.location.trim() || null;
    }

    if (dto.status !== undefined) {
      incident.status = dto.status;
      incident.resolvedAt =
        dto.status === IncidentStatus.RESOLVED
          ? incident.resolvedAt ?? new Date()
          : null;
    }

    return this.incidentsRepository.save(incident);
  }

  async remove(organizerId: string, incidentId: string) {
    const incident = await this.findOwnedIncident(
      organizerId,
      incidentId,
    );

    await this.incidentsRepository.remove(incident);

    return { message: "Incident deleted successfully" };
  }

  private async findOwnedIncident(
    organizerId: string,
    incidentId: string,
  ) {
    const incident = await this.incidentsRepository.findOne({
      where: {
        id: incidentId,
        organizerId,
      },
    });

    if (!incident) {
      throw new NotFoundException("Incident not found");
    }

    return incident;
  }
}

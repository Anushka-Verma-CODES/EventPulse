import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event, EventStatus } from "./entities/event.entity";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    organizerId: string,
  ): Promise<Event> {
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (
      !Number.isFinite(startDate.getTime()) ||
      !Number.isFinite(endDate.getTime()) ||
      endDate <= startDate
    ) {
      throw new BadRequestException(
        "End date must be after start date.",
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      startDate,
      endDate,
      price: String(createEventDto.price),
      organizerId,
      status: EventStatus.DRAFT,
    });

    return this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      where: {
        status: EventStatus.PUBLISHED,
      },
      order: {
        startDate: "ASC",
      },
    });
  }
  
  async findMyEvents(organizerId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { organizerId },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Event> {
  const event = await this.eventRepository.findOne({
    where: { id },
  });

  if (!event) {
    throw new NotFoundException("Event not found.");
  }

  return event;
}

  
  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    organizerId: string,
  ): Promise<Event> {
      const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException("Event not found.");
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        "You can only update your own events.",
      );
    }

  const startDate = updateEventDto.startDate
    ? new Date(updateEventDto.startDate)
    : event.startDate;

  const endDate = updateEventDto.endDate
    ? new Date(updateEventDto.endDate)
    : event.endDate;

  if (
    !Number.isFinite(startDate.getTime()) ||
    !Number.isFinite(endDate.getTime()) ||
    endDate <= startDate
  ) {
    throw new BadRequestException(
      "End date must be after start date.",
    );
  }

  Object.assign(event, updateEventDto, {
    startDate,
    endDate,
  });

  return this.eventRepository.save(event);
  }

    
  async publish(id: string, organizerId: string): Promise<Event> {
  const event = await this.eventRepository.findOne({
    where: { id },
  });

  if (!event) {
    throw new NotFoundException("Event not found.");
  }

  if (event.organizerId !== organizerId) {
    throw new ForbiddenException(
      "You can only publish your own events.",
    );
  }

  if (event.status === EventStatus.CANCELLED) {
    throw new BadRequestException(
      "Cancelled events cannot be published.",
    );
  }

  event.status = EventStatus.PUBLISHED;

  return this.eventRepository.save(event);
  }

  
  async cancel(id: string, organizerId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException("Event not found.");
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        "You can only cancel your own events.",
      );
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException("Event is already cancelled.");
    }

    event.status = EventStatus.CANCELLED;

    return this.eventRepository.save(event);
  }


}

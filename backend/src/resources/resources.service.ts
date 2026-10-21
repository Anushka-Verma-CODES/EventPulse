
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../events/entities/event.entity";
import { Resource } from "./entities/resource.entity";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  private async verifyEventOwnership(
    eventId: string,
    organizerId: string,
  ): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found.");
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        "You can only manage resources for your own events.",
      );
    }

    return event;
  }

  private validateQuantities(
    totalQuantity: number,
    usedQuantity: number,
    lowStockThreshold: number,
  ): void {
    if (usedQuantity > totalQuantity) {
      throw new BadRequestException(
        "Used quantity cannot exceed total quantity.",
      );
    }

    if (lowStockThreshold > totalQuantity) {
      throw new BadRequestException(
        "Low-stock threshold cannot exceed total quantity.",
      );
    }
  }

  private addStockStatus(resource: Resource) {
    const availableQuantity =
      resource.totalQuantity - resource.usedQuantity;

    let status: "Available" | "Low" | "Critical";

    if (availableQuantity === 0) {
      status = "Critical";
    } else if (availableQuantity <= resource.lowStockThreshold) {
      status = "Low";
    } else {
      status = "Available";
    }

    return {
      ...resource,
      availableQuantity,
      status,
    };
  }

  async findAll(organizerId: string) {
    const resources = await this.resourceRepository
      .createQueryBuilder("resource")
      .innerJoin(
        Event,
        "event",
        "event.id = resource.eventId",
      )
      .where("event.organizerId = :organizerId", {
        organizerId,
      })
      .orderBy("resource.createdAt", "DESC")
      .getMany();

    return resources.map((resource) =>
      this.addStockStatus(resource),
    );
  }

  async create(
    organizerId: string,
    input: CreateResourceDto,
  ) {
    await this.verifyEventOwnership(input.eventId, organizerId);

    const usedQuantity = input.usedQuantity ?? 0;
    const lowStockThreshold = input.lowStockThreshold ?? 5;

    this.validateQuantities(
      input.totalQuantity,
      usedQuantity,
      lowStockThreshold,
    );

    const resource = this.resourceRepository.create({
      ...input,
      category: input.category ?? "General",
      usedQuantity,
      lowStockThreshold,
      unit: input.unit ?? "units",
      notes: input.notes ?? null,
    });

    const savedResource =
      await this.resourceRepository.save(resource);

    return this.addStockStatus(savedResource);
  }

  async update(
    organizerId: string,
    resourceId: string,
    input: UpdateResourceDto,
  ) {
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException("Resource not found.");
    }

    await this.verifyEventOwnership(
      resource.eventId,
      organizerId,
    );

    const totalQuantity =
      input.totalQuantity ?? resource.totalQuantity;

    const usedQuantity =
      input.usedQuantity ?? resource.usedQuantity;

    const lowStockThreshold =
      input.lowStockThreshold ?? resource.lowStockThreshold;

    this.validateQuantities(
      totalQuantity,
      usedQuantity,
      lowStockThreshold,
    );

    Object.assign(resource, input);

    const savedResource =
      await this.resourceRepository.save(resource);

    return this.addStockStatus(savedResource);
  }

  async remove(
    organizerId: string,
    resourceId: string,
  ) {
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException("Resource not found.");
    }

    await this.verifyEventOwnership(
      resource.eventId,
      organizerId,
    );

    await this.resourceRepository.remove(resource);

    return { message: "Resource deleted successfully." };
  }
}

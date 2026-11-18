import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TicketListing } from './ticket-listing.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Event, EventStatus } from '../events/entities/event.entity';

@Injectable()
export class TicketListingsService {
  constructor(
    @InjectRepository(TicketListing)
    private readonly ticketListingRepository: Repository<TicketListing>,

    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  // =========================================================
  // FIND AVAILABLE RESALE LISTINGS
  // =========================================================

  async findAvailable(eventId?: string): Promise<TicketListing[]> {
    const query = this.ticketListingRepository
      .createQueryBuilder('listing')
      .innerJoin(
        Event,
        'event',
        'event.id = listing.eventId',
      )
      .where('listing.status = :status', {
        status: 'AVAILABLE',
      })
      .andWhere('event.startDate > :now', {
        now: new Date(),
      })
      .andWhere('event.status = :eventStatus', {
        eventStatus: EventStatus.PUBLISHED,
      });

    if (eventId) {
      query.andWhere('listing.eventId = :eventId', {
        eventId,
      });
    }

    return query
      .orderBy('listing.createdAt', 'DESC')
      .getMany();
  }

  // =========================================================
  // CREATE RESALE LISTING
  // =========================================================

  async create(
    attendeeId: string,
    data: Partial<TicketListing>,
  ): Promise<TicketListing> {
    if (
      !data.eventId ||
      !data.ticketCode ||
      !data.sellerName?.trim() ||
      data.price === undefined ||
      !Number.isFinite(Number(data.price)) ||
      Number(data.price) <= 0 ||
      !data.paymentMethod ||
      !data.paymentAccount?.trim() ||
      !data.reason?.trim()
    ) {
      throw new BadRequestException(
        'Please provide all required listing details and a valid price.',
      );
    }

    // Fetch original event details.
    const event = await this.eventsRepository.findOne({
      where: {
        id: data.eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    // Only published events can have resale listings.
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        'Tickets can only be listed for published events.',
      );
    }

    // IMPORTANT: Resale closes at the exact event start time.
    if (new Date(event.startDate).getTime() <= Date.now()) {
      throw new BadRequestException(
        'Ticket resale is closed because this event has already started.',
      );
    }

    // Resale price cannot exceed original ticket price.
    const resalePrice = Number(data.price);
    const originalPrice = Number(event.price);

    if (resalePrice > originalPrice) {
      throw new BadRequestException(
        `Resale price cannot exceed the original ticket price of ₹${originalPrice}.`,
      );
    }

    // Verify ticket ownership.
    const registration = await this.registrationsRepository.findOne({
      where: {
        attendeeId,
        eventId: data.eventId,
      },
    });

    if (!registration) {
      throw new ForbiddenException(
        'You do not own a ticket for this event.',
      );
    }

    const expectedTicketCode =
      `EP-${registration.id.slice(0, 8).toUpperCase()}`;

    if (data.ticketCode !== expectedTicketCode) {
      throw new ForbiddenException(
        'This ticket does not belong to your registration.',
      );
    }

    // Prevent duplicate active resale listings.
    const existingListing = await this.ticketListingRepository.findOne({
      where: {
        eventId: data.eventId,
        ticketCode: data.ticketCode,
        status: 'AVAILABLE',
      },
    });

    if (existingListing) {
      throw new ConflictException(
        'This ticket is already listed for resale.',
      );
    }

    const listing = this.ticketListingRepository.create({
      eventId: data.eventId,
      ticketCode: data.ticketCode,
      sellerName: data.sellerName.trim(),
      price: resalePrice,
      paymentMethod: data.paymentMethod,
      paymentAccount: data.paymentAccount.trim(),
      reason: data.reason.trim(),
      status: 'AVAILABLE',
    });

    try {
      return await this.ticketListingRepository.save(listing);
    } catch (error: unknown) {
      const databaseError = error as {
        code?: string;
        driverError?: { code?: string };
      };

      if (
        databaseError.code === '23505' ||
        databaseError.driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'This ticket is already listed for resale.',
        );
      }

      throw error;
    }
  }

  // =========================================================
  // FIND SINGLE LISTING
  // =========================================================

  async findOne(id: string): Promise<TicketListing> {
    const listing = await this.ticketListingRepository.findOne({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Ticket listing not found.');
    }

    return listing;
  }
}
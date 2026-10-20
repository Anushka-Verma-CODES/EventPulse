
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

@Injectable()
export class TicketListingsService {
  constructor(
    @InjectRepository(TicketListing)
    private readonly ticketListingRepository: Repository<TicketListing>,

    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
  ) {}

  async findAvailable(eventId?: string): Promise<TicketListing[]> {
    const query = this.ticketListingRepository
      .createQueryBuilder('listing')
      .where('listing.status = :status', { status: 'AVAILABLE' });

    if (eventId) {
      query.andWhere('listing.eventId = :eventId', { eventId });
    }

    return query.orderBy('listing.createdAt', 'DESC').getMany();
  }

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
      price: Number(data.price),
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

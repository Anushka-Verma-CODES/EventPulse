
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketListing } from './ticket-listing.entity';

@Injectable()
export class TicketListingsService {
  constructor(
    @InjectRepository(TicketListing)
    private readonly ticketListingRepository: Repository<TicketListing>,
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

    return this.ticketListingRepository.save(listing);
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

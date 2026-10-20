
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TicketListingsService } from './ticket-listings.service';
import { TicketListing } from './ticket-listing.entity';

@Controller('ticket-listings')
export class TicketListingsController {
  constructor(
    private readonly ticketListingsService: TicketListingsService,
  ) {}

  @Get()
  async getAvailableListings(
    @Query('eventId') eventId?: string,
  ): Promise<TicketListing[]> {
    return this.ticketListingsService.findAvailable(eventId);
  }

  @Post()
  async createListing(
    @Body() body: Partial<TicketListing>,
  ): Promise<TicketListing> {
    return this.ticketListingsService.create(body);
  }

  @Get(':id')
  async getListing(
    @Param('id') id: string,
  ): Promise<TicketListing> {
    return this.ticketListingsService.findOne(id);
  }
}

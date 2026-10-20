
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketListingsService } from './ticket-listings.service';
import { TicketListing } from './ticket-listing.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  async createListing(
    @Req() request: { user: { userId: string } },
    @Body() body: Partial<TicketListing>,
  ): Promise<TicketListing> {
    return this.ticketListingsService.create(
      request.user.userId,
      body,
    );
  }

  @Get(':id')
  async getListing(
    @Param('id') id: string,
  ): Promise<TicketListing> {
    return this.ticketListingsService.findOne(id);
  }
}

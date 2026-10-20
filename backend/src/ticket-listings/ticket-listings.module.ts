import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketListing } from './ticket-listing.entity';
import { TicketListingsService } from './ticket-listings.service';
import { TicketListingsController } from './ticket-listings.controller';
import { Registration } from '../registrations/entities/registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketListing,Registration,])],
  controllers: [TicketListingsController],
  providers: [TicketListingsService],
  exports: [TicketListingsService],
})
export class TicketListingsModule {}

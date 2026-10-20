import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketListing } from './ticket-listing.entity';
import { TicketListingsService } from './ticket-listings.service';
import { TicketListingsController } from './ticket-listings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TicketListing])],
  controllers: [TicketListingsController],
  providers: [TicketListingsService],
  exports: [TicketListingsService],
})
export class TicketListingsModule {}

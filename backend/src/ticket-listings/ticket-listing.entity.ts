
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ticket_listings')
@Index(
  'UQ_ticket_listing_active_ticket',
  ['eventId', 'ticketCode'],
  {
    unique: true,
    where: `"status" = 'AVAILABLE'`,
  },
)
export class TicketListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @Column()
  ticketCode: string;

  @Column()
  sellerName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  paymentMethod: string;

  @Column()
  paymentAccount: string;

  @Column('text')
  reason: string;

  @Column({ default: 'AVAILABLE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

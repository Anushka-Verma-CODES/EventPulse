
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ticket_listings')
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

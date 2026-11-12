
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';

import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';
import { EventGate } from '../../gates/entities/event-gate.entity';

@Entity('scanner_event_assignments')
@Unique(['eventId', 'scannerUserId'])
@Index(['eventId', 'gateId', 'isActive'])
export class ScannerEventAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'uuid' })
  scannerUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scannerUserId' })
  scanner: User;

  @Column({ type: 'uuid' })
  assignedByOrganizerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignedByOrganizerId' })
  assignedByOrganizer: User;

  // Gate assigned to this scanner for this event
  @Column({ type: 'uuid', nullable: true })
  gateId: string | null;

  @ManyToOne(() => EventGate, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'gateId' })
  gate: EventGate | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

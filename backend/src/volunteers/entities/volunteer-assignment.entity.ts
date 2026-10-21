import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum VolunteerAssignmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('volunteer_assignments')
export class VolunteerAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  volunteerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'volunteerId' })
  volunteer: User;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'varchar', length: 100 })
  assignedRole: string;

  @Column({
    type: 'enum',
    enum: VolunteerAssignmentStatus,
    default: VolunteerAssignmentStatus.ASSIGNED,
  })
  status: VolunteerAssignmentStatus;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    default: 0,
  })
  hoursWorked: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

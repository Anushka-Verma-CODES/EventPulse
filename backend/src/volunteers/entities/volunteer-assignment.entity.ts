
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
  PENDING_ACCEPTANCE = 'pending_acceptance',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum VolunteerHoursApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FLAGGED = 'flagged',
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
    default: VolunteerAssignmentStatus.PENDING_ACCEPTANCE,
  })
  status: VolunteerAssignmentStatus;

  // Organizer-defined shift schedule
  @Column({ type: 'timestamp', nullable: true })
  scheduledStartAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduledEndAt: Date | null;

  // Actual volunteer working timestamps
  @Column({ type: 'timestamp', nullable: true })
  actualStartedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  actualEndedAt: Date | null;

  // Calculated by the backend
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    default: 0,
  })
  hoursWorked: string;

  @Column({
    type: 'enum',
    enum: VolunteerHoursApprovalStatus,
    default: VolunteerHoursApprovalStatus.PENDING,
  })
  hoursApprovalStatus: VolunteerHoursApprovalStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

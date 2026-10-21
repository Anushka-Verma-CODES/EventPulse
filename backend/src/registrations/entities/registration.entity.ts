
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Event } from "../../events/entities/event.entity";

@Entity("registrations")
@Unique(["attendeeId", "eventId"])
@Unique(["qrToken"])
export class Registration {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  attendeeId: string;

  @Column({ type: "uuid" })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @Column({ type: "varchar", length: 64, nullable: true })
  qrToken: string | null;

  @Column({ type: "boolean", default: false })
  isCheckedIn: boolean;

  @Column({ type: "timestamptz", nullable: true })
  checkedInAt: Date | null;

  @CreateDateColumn()
  registeredAt: Date;
}

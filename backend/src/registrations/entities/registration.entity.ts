
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

  @CreateDateColumn()
  registeredAt: Date;
}

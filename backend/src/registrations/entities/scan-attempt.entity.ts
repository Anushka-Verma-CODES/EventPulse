
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("scan_attempts")
export class ScanAttempt {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  scannerUserId: string;

  @Column({ type: "uuid", nullable: true })
  eventId: string | null;

  @Column({ type: "uuid", nullable: true })
  registrationId: string | null;

  @Column({ type: "varchar", length: 30 })
  result: string;

  @Column({ type: "varchar", length: 255 })
  message: string;

  @CreateDateColumn({ type: "timestamptz" })
  scannedAt: Date;
}

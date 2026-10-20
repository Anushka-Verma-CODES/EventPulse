import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUND_PENDING = "refund_pending",
  REFUNDED = "refunded",
}

@Entity("payments")
@Index(["razorpayOrderId"], { unique: true })
@Index(["razorpayPaymentId"], { unique: true })
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  attendeeId: string;

  @Column({ type: "uuid" })
  eventId: string;

  @Column({ type: "varchar", length: 100, unique: true })
  razorpayOrderId: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  razorpayPaymentId: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  razorpayRefundId: string | null;

  @Column({ type: "integer" })
  amountPaise: number;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
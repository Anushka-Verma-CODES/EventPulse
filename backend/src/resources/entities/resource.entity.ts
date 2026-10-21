
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("resources")
export class Resource {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  eventId: string;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "varchar", length: 80, default: "General" })
  category: string;

  @Column({ type: "int" })
  totalQuantity: number;

  @Column({ type: "int", default: 0 })
  usedQuantity: number;

  @Column({ type: "int", default: 5 })
  lowStockThreshold: number;

  @Column({ type: "varchar", length: 30, default: "units" })
  unit: string;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

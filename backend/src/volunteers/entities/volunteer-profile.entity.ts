import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('volunteer_profiles')
export class VolunteerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  skills: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  preferredRoles: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  availability: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

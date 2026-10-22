
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRoleAssignment } from './user-role-assignment.entity';

export interface UserSettings {
  language: 'English' | 'Hindi';
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  compactMode: boolean;
  soundOnScan: boolean;
  vibrationOnScan: boolean;
  notificationPreferences: Record<string, boolean>;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  language: 'English',
  emailNotifications: true,
  pushNotifications: true,
  eventReminders: true,
  compactMode: false,
  soundOnScan: true,
  vibrationOnScan: true,
  notificationPreferences: {},
};

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', select: false })
  passwordHash: string;

  @Column({
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  settings: Partial<UserSettings>;

  @OneToMany(
    () => UserRoleAssignment,
    (roleAssignment) => roleAssignment.user,
  )
  roleAssignments: UserRoleAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

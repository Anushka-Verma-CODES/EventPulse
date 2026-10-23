
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserSettings,
  DEFAULT_USER_SETTINGS,
} from './entities/user.entity';
import { UserRoleAssignment } from './entities/user-role-assignment.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(UserRoleAssignment)
    private readonly rolesRepository: Repository<UserRoleAssignment>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.trim().toLowerCase() },
      relations: { roleAssignments: true },
    });
  }

  async findByEmailForLogin(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.roleAssignments', 'roleAssignment')
      .where('user.email = :email', {
        email: email.trim().toLowerCase(),
      })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { roleAssignments: true },
    });
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const assignments = await this.rolesRepository.find({
      where: { userId },
    });

    return assignments.map((assignment) => assignment.role);
  }

  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const assignment = await this.rolesRepository.findOne({
      where: { userId, role },
    });

    return assignment !== null;
  }

  async createUser(data: {
    fullName: string;
    email: string;
    phone?: string;
    passwordHash: string;
  }): Promise<User> {
    const user = this.usersRepository.create({
      fullName: data.fullName,
      email: data.email.trim().toLowerCase(),
      phone: data.phone ?? null,
      passwordHash: data.passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async updateProfile(
    userId: string,
    data: {
      fullName: string;
      email: string;
      phone?: string | null;
    },
  ): Promise<User> {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: {
        email,
        id: Not(userId),
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'This email address is already in use',
      );
    }

    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.fullName = data.fullName.trim();
    user.email = email;
    user.phone = data.phone?.trim() || null;

    return this.usersRepository.save(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.passwordHash,
    );

    if (samePassword) {
      throw new ConflictException(
        'New password must be different from the current password',
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);

    await this.usersRepository.save(user);
  }

  async findVolunteers(): Promise<
    { id: string; fullName: string; email: string }[]
  > {
    const volunteers = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin(
        'user.roleAssignments',
        'roleAssignment',
        'roleAssignment.role = :role',
        { role: UserRole.VOLUNTEER },
      )
      .select([
        'user.id',
        'user.fullName',
        'user.email',
      ])
      .orderBy('user.fullName', 'ASC')
      .getMany();

    return volunteers.map((volunteer) => ({
      id: volunteer.id,
      fullName: volunteer.fullName,
      email: volunteer.email,
    }));
  }

  async getSettings(userId: string): Promise<UserSettings> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...DEFAULT_USER_SETTINGS,
      ...user.settings,
      notificationPreferences: {
        ...DEFAULT_USER_SETTINGS.notificationPreferences,
        ...user.settings?.notificationPreferences,
      },
    };
  }

  async updateSettings(
    userId: string,
    settings: Partial<UserSettings>,
  ): Promise<UserSettings> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.settings = {
      ...DEFAULT_USER_SETTINGS,
      ...user.settings,
      ...settings,
      notificationPreferences: {
        ...DEFAULT_USER_SETTINGS.notificationPreferences,
        ...user.settings?.notificationPreferences,
        ...settings.notificationPreferences,
      },
    };

    await this.usersRepository.save(user);

    return this.getSettings(userId);
  }

  async assignRole(userId: string, role: UserRole): Promise<void> {
    const existingAssignment = await this.rolesRepository.findOne({
      where: { userId, role },
    });

    if (existingAssignment) {
      return;
    }

    const assignment = this.rolesRepository.create({
      userId,
      role,
    });

    await this.rolesRepository.save(assignment);
  }
}

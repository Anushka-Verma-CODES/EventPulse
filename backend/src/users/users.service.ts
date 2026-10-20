import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
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

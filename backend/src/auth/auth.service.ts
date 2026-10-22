import { QueryFailedError } from 'typeorm';

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  
async register(registerDto: RegisterDto) {
  const existingUser = await this.usersService.findByEmail(
    registerDto.email,
  );

  if (existingUser) {
    throw new ConflictException('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(registerDto.password, 12);

  let user;

  try {
    user = await this.usersService.createUser({
      fullName: registerDto.fullName,
      email: registerDto.email,
      phone: registerDto.phone,
      passwordHash,
    });
  } catch (error) {
    if (
      error instanceof QueryFailedError &&
      (
        error as QueryFailedError & {
          driverError?: { code?: string };
        }
      ).driverError?.code === '23505'
    ) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    throw error;
  }

  await this.usersService.assignRole(
    user.id,
    UserRole.ATTENDEE,
  );

  const createdUser = await this.usersService.findById(user.id);

  if (!createdUser) {
    throw new Error('Unable to load the registered user.');
  }

  const roles = createdUser.roleAssignments.map(
    (assignment) => assignment.role,
  );

  const accessToken = await this.jwtService.signAsync({
    sub: createdUser.id,
    email: createdUser.email,
    roles,
  });

  return {
    message: 'Registration successful',
    accessToken,
    user: {
      id: createdUser.id,
      fullName: createdUser.fullName,
      email: createdUser.email,
      phone: createdUser.phone,
      roles,
    },
  };
}


  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailForLogin(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.roleAssignments.map(
      (assignment) => assignment.role,
    );

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles,
    });

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        roles,
      },
    };
  }

  async refreshAccessToken(userId: string) {
  const user = await this.usersService.findById(userId);

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  const roles = user.roleAssignments.map(
    (assignment) => assignment.role,
  );

  const accessToken = await this.jwtService.signAsync({
    sub: user.id,
    email: user.email,
    roles,
  });

  return {
    accessToken,
    roles,
  };
}

}

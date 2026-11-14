
import { QueryFailedError } from 'typeorm';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  
async register(registerDto: RegisterDto) {
  const existingUser = await this.usersService.findByEmail(
    registerDto.email,
  );

  const normalizedPhone = registerDto.phone?.trim();

  if (!normalizedPhone) {
    throw new BadRequestException('Mobile number is required');
  }

  const existingPhone = await this.usersService.findByPhone(
    normalizedPhone,
  );

  if (existingUser && existingPhone) {
    throw new ConflictException(
      'This email and mobile number are already registered.',
    );
  }

  if (existingUser) {
    throw new ConflictException(
      'Email is already registered',
    );
  }

  if (existingPhone) {
    throw new ConflictException(
      'This mobile number is already registered. Please use another number.',
    );
  }

  const passwordHash = await bcrypt.hash(registerDto.password, 12);

  let user;

  try {
    user = await this.usersService.createUser({
      fullName: registerDto.fullName,
      email: registerDto.email,
      phone: normalizedPhone,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof QueryFailedError) {
      const driverError = (
        error as QueryFailedError & {
          driverError?: {
            code?: string;
            constraint?: string;
          };
        }
      ).driverError;

      if (driverError?.code === '23505') {
        if (driverError.constraint === 'UQ_users_phone') {
          throw new ConflictException(
            'This mobile number is already registered. Please use another number.',
          );
        }

        throw new ConflictException(
          'Email is already registered',
        );
      }
    }

    throw error;
  }

  await this.usersService.assignRole(user.id, UserRole.ATTENDEE);

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
      throw new UnauthorizedException(
        'No account found with this email. Please check your email.',
      );
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Wrong password entered. Try again.',
      );
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

  async forgotPassword(email: string, origin?: string) {
    const localUrl = this.configService.get<string>(
      'FRONTEND_LOCAL_URL',
    );

    const productionUrl = this.configService.get<string>(
      'FRONTEND_PRODUCTION_URL',
    );

    const allowedUrls = [localUrl, productionUrl].filter(
      (url): url is string => Boolean(url),
    );

    const frontendUrl = allowedUrls.find(
      (url) => url.replace(/\/$/, '') === origin?.replace(/\/$/, ''),
    );

    if (!frontendUrl) {
      throw new BadRequestException('Invalid frontend origin');
    }

    const user = await this.usersService.findByEmail(
      email.trim().toLowerCase(),
    );

    const responseMessage =
      'If an account with that email exists, a password reset link has been sent.';

    if (!user) {
      return { message: responseMessage };
    }

    const token = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersService.savePasswordResetToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    const resetLink =
      `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

    const brevoApiKey = this.configService.get<string>(
      'BREVO_API_KEY',
    );

    const senderEmail = this.configService.get<string>(
      'BREVO_SENDER_EMAIL',
    );

    const senderName =
      this.configService.get<string>('BREVO_SENDER_NAME') ||
      'EventPulse';

    if (!brevoApiKey || !senderEmail) {
      throw new InternalServerErrorException(
        'Brevo email service is not configured',
      );
    }

    try {
      const response = await fetch(
        'https://api.brevo.com/v3/smtp/email',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: senderName,
              email: senderEmail,
            },
            to: [
              {
                email: user.email,
              },
            ],
            subject: 'Reset your EventPulse password',
            textContent: `You requested a password reset for your EventPulse account.

Open this link to reset your password:
${resetLink}

This link expires in 15 minutes. If you did not request this, you can ignore this email.`,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto;">
                <h2>Reset your EventPulse password</h2>
                <p>We received a request to reset your EventPulse account password.</p>
                <p>
                  <a href="${resetLink}"
                     style="display: inline-block; padding: 12px 22px;
                     background-color: #2563eb; color: white;
                     text-decoration: none; border-radius: 6px;">
                    Reset Password
                  </a>
                </p>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, you can ignore this email.</p>
              </div>
            `,
          }),
        },
      );

      if (!response.ok) {
        const errorDetails = await response.text();

        console.error('Brevo email API failed:', errorDetails);

        throw new Error('Brevo rejected the email request');
      }
    } catch (error) {
      console.error('Password reset email failed:', error);

      throw new InternalServerErrorException(
        'Unable to send password reset email',
      );
    }

    return { message: responseMessage };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.usersService.findByPasswordResetToken(
      tokenHash,
    );

    if (
      !user ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'Reset link is invalid or expired',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.usersService.resetUserPassword(user, passwordHash);

    return {
      message: 'Password has been reset successfully',
    };
  }
}

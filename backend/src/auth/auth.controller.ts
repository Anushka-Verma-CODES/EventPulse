import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  UseGuards,
  Request,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ActivateRoleDto } from './dto/activate-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Request() req: { user: { userId: string } },
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(
      req.user.userId,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      roles: user.roleAssignments.map(
        (assignment) => assignment.role,
      ),
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.updateProfile(
      req.user.userId,
      dto,
    );

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      roles: user.roleAssignments.map(
        (assignment) => assignment.role,
      ),
    };
  }

  @Post('activate-role')
  @UseGuards(JwtAuthGuard)
  async activateRole(
    @Request() req: { user: { userId: string } },
    @Body() dto: ActivateRoleDto,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException();
    }

    await this.usersService.assignRole(
      req.user.userId,
      dto.role,
    );

    const user = await this.usersService.findById(
      req.user.userId,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { accessToken, roles } =
      await this.authService.refreshAccessToken(user.id);

    return {
      message: 'Role activated successfully',
      accessToken,
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      roles,
    };
  }
}

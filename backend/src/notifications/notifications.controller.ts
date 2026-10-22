import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.notificationsService.findAll(userId);
  }

  @Patch('read-all')
  markAllAsRead(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.notificationsService.markAsRead(id, userId);
  }
}
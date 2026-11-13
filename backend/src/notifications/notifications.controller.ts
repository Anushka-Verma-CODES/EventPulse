
import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  Post,
  Delete,
  Body,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { PushNotificationsService } from './push-notifications.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

interface PushSubscriptionBody {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UnsubscribeBody {
  endpoint: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
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

  @Get('push/public-key')
  getPushPublicKey() {
    return {
      publicKey: this.pushNotificationsService.getPublicKey(),
    };
  }

  @Post('push/subscribe')
  subscribeToPush(
    @Body() body: PushSubscriptionBody,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.pushNotificationsService.subscribe(userId, body);
  }

  @Delete('push/unsubscribe')
  unsubscribeFromPush(
    @Body() body: UnsubscribeBody,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.pushNotificationsService.unsubscribe(
      userId,
      body.endpoint,
    );
  }
}

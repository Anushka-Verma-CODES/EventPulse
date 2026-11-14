
import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { PushNotificationsService } from './push-notifications.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    userId: string,
    data: {
      title: string;
      message: string;
      type?: string;
      link?: string | null;
    },
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      title: data.title,
      message: data.message,
      type: data.type ?? 'general',
      link: data.link ?? null,
      isRead: false,
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    this.notificationsGateway.sendNotification(
      userId,
      savedNotification,
    );

    void this.pushNotificationsService
      .sendToUser(userId, {
        title: savedNotification.title,
        message: savedNotification.message,
        link: savedNotification.link,
        notificationId: savedNotification.id,
      })
      .catch((error: unknown) => {
        this.logger.error(
          'Failed to process push notification delivery.',
          error instanceof Error ? error.stack : String(error),
        );
      });

    return savedNotification;
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      return this.notificationRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return {
      updated: result.affected ?? 0,
    };
  }
}

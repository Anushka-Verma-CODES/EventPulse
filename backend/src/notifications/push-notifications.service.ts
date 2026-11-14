
import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webPush from 'web-push';
import { PushSubscription } from './entities/push-subscription.entity';

interface BrowserPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushNotificationPayload {
  title: string;
  message: string;
  link: string | null;
  notificationId: string;
}

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subscriptionRepository: Repository<PushSubscription>,
    private readonly configService: ConfigService,
  ) {
    webPush.setVapidDetails(
      this.configService.getOrThrow<string>('VAPID_SUBJECT'),
      this.configService.getOrThrow<string>('VAPID_PUBLIC_KEY'),
      this.configService.getOrThrow<string>('VAPID_PRIVATE_KEY'),
    );
  }

  getPublicKey(): string {
    return this.configService.getOrThrow<string>('VAPID_PUBLIC_KEY');
  }

  async subscribe(
    userId: string,
    subscription: BrowserPushSubscription,
  ): Promise<{ message: string }> {
    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      throw new BadRequestException('Invalid push subscription.');
    }

    let endpointUrl: URL;

    try {
      endpointUrl = new URL(subscription.endpoint);
    } catch {
      throw new BadRequestException('Invalid subscription endpoint.');
    }

    if (endpointUrl.protocol !== 'https:') {
      throw new BadRequestException(
        'Subscription endpoint must use HTTPS.',
      );
    }

    const existing = await this.subscriptionRepository.findOne({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      existing.userId = userId;
      existing.p256dh = subscription.keys.p256dh;
      existing.auth = subscription.keys.auth;

      await this.subscriptionRepository.save(existing);
    } else {
      const newSubscription = this.subscriptionRepository.create({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });

      await this.subscriptionRepository.save(newSubscription);
    }

    return { message: 'Push subscription saved successfully.' };
  }

  async unsubscribe(
    userId: string,
    endpoint: string,
  ): Promise<{ message: string }> {
    if (!endpoint) {
      throw new BadRequestException(
        'Subscription endpoint is required.',
      );
    }

    await this.subscriptionRepository.delete({
      userId,
      endpoint,
    });

    return { message: 'Push subscription removed successfully.' };
  }

  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<void> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.message,
      url: payload.link || '/notifications',
      notificationId: payload.notificationId,
    });

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            notificationPayload,
          );
        } catch (error: unknown) {
          const statusCode =
            typeof error === 'object' &&
            error !== null &&
            'statusCode' in error
              ? (error as { statusCode?: number }).statusCode
              : undefined;

          if (statusCode === 404 || statusCode === 410) {
            await this.subscriptionRepository.delete({
              id: subscription.id,
            });

            return;
          }

          this.logger.error(
            `Push delivery failed for subscription ${subscription.id}.`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }),
    );
  }
}

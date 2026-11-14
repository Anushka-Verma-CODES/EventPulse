
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

interface JwtPayload {
  sub: string;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: [
      'http://localhost:5173',
      'http://172.16.78.105:5173',
      'https://event-pulse-lovat.vercel.app',
    ],
    credentials: true,
  },
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        this.getTokenFromHeader(client);

      if (!token || typeof token !== 'string') {
        throw new UnauthorizedException('Authentication token missing.');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        },
      );

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid authentication token.');
      }

      client.data.userId = payload.sub;

      await client.join(this.getUserRoom(payload.sub));
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      void client.leave(this.getUserRoom(userId));
    }
  }

  sendNotification(userId: string, notification: unknown) {
    this.server
      .to(this.getUserRoom(userId))
      .emit('notification:new', notification);
  }

  private getUserRoom(userId: string): string {
    return `user:${userId}`;
  }

  private getTokenFromHeader(client: Socket): string | null {
    const authorization = client.handshake.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    return authorization.substring(7);
  }
}

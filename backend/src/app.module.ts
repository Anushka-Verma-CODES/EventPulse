import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { TicketListingsModule } from './ticket-listings/ticket-listings.module';
import { Payment } from './payments/entities/payment.entity';
import { PaymentsModule } from './payments/payments.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { ResourcesModule } from "./resources/resources.module";
import { IncidentsModule } from "./incidents/incidents.module";
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
      type: 'postgres' as const,
      url: configService.getOrThrow<string>('DATABASE_URL'),
      autoLoadEntities: true,
      synchronize: configService.get('NODE_ENV') === 'development',
    }),
  }),
    UsersModule,
    AuthModule,
    EventsModule,
    RegistrationsModule,
    TicketListingsModule,
    PaymentsModule,
    VolunteersModule,
    ResourcesModule,
    IncidentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

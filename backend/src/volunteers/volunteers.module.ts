
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VolunteerProfile } from './entities/volunteer-profile.entity';
import { VolunteerAssignment } from './entities/volunteer-assignment.entity';
import { VolunteerApplication } from './entities/volunteer-application.entity';
import { ScannerEventAssignment } from './entities/scanner-event-assignment.entity';

import { Event } from '../events/entities/event.entity';
import { EventGate } from '../gates/entities/event-gate.entity';

import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';

import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VolunteerProfile,
      VolunteerAssignment,
      VolunteerApplication,
      ScannerEventAssignment,
      Event,
      EventGate,
    ]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [
    VolunteersController,
  ],
  providers: [
    VolunteersService,
  ],
  exports: [
    VolunteersService,
  ],
})
export class VolunteersModule {}

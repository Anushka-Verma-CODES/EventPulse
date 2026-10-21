
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerProfile } from './entities/volunteer-profile.entity';
import { VolunteerAssignment } from './entities/volunteer-assignment.entity';
import { Event } from '../events/entities/event.entity';
import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';
import { UsersModule } from '../users/users.module';
import { VolunteerApplication } from './entities/volunteer-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VolunteerProfile,
      VolunteerAssignment,
      VolunteerApplication,
      Event,
    ]),
    UsersModule,
  ],
  controllers: [VolunteersController],
  providers: [VolunteersService],
  exports: [VolunteersService],
})
export class VolunteersModule {}

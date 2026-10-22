import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "../events/entities/event.entity";
import { UsersModule } from "../users/users.module";
import { Registration } from "./entities/registration.entity";
import { RegistrationsController } from "./registrations.controller";
import { RegistrationsService } from "./registrations.service";
import { ScannerEventAssignment } from '../volunteers/entities/scanner-event-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Registration, Event,ScannerEventAssignment,]),
    UsersModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
})
export class RegistrationsModule {}

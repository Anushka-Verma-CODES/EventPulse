import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "../events/entities/event.entity";
import { Incident } from "./entities/incident.entity";
import { IncidentsController } from "./incidents.controller";
import { IncidentsService } from "./incidents.service";
import { Registration } from "../registrations/entities/registration.entity";

@Module({
  imports: [
  TypeOrmModule.forFeature([Incident, Event, Registration]),
],
  controllers: [IncidentsController],
  providers: [IncidentsService],
})
export class IncidentsModule {}
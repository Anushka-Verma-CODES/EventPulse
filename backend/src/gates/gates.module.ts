
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event } from '../events/entities/event.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { UsersModule } from '../users/users.module';

import { EventGate } from './entities/event-gate.entity';
import { GatesController } from './gates.controller';
import { GatesService } from './gates.service';
import { GateThresholdsController } from './gate-thresholds.controller';
import { GateThresholdsService } from './gate-thresholds.service';
import { LiveEntryStatusController } from './live-entry-status.controller';
import { LiveEntryStatusService } from './live-entry-status.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventGate,
      Registration,
    ]),
    UsersModule,
  ],
  controllers: [
    GatesController,
    GateThresholdsController,
    LiveEntryStatusController,
  ],
  providers: [
    GatesService,
    GateThresholdsService,
    LiveEntryStatusService,
  ],
  exports: [
    GatesService,
    GateThresholdsService,
  ],
})
export class GatesModule {}

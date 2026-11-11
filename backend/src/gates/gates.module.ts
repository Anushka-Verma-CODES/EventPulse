
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
  ],
  providers: [
    GatesService,
    GateThresholdsService,
  ],
  exports: [
    GatesService,
    GateThresholdsService,
  ],
})
export class GatesModule {}


import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GateThresholdsService } from './gate-thresholds.service';
import { UpdateGateThresholdsDto } from './dto/update-gate-thresholds.dto';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

@Controller('events/:eventId/gate-thresholds')
@UseGuards(JwtAuthGuard)
export class GateThresholdsController {
  constructor(
    private readonly gateThresholdsService: GateThresholdsService,
  ) {}

  @Get()
  getThresholds(
    @Param('eventId') eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.gateThresholdsService.getThresholds(
      request.user.userId,
      eventId,
    );
  }

  @Patch()
  updateThresholds(
    @Param('eventId') eventId: string,
    @Body() dto: UpdateGateThresholdsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.gateThresholdsService.updateThresholds(
      request.user.userId,
      eventId,
      dto,
    );
  }
}

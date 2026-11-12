
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GatesService } from './gates.service';
import { CreateGateDto } from './dto/create-gate.dto';
import { UpdateGateDto } from './dto/update-gate.dto';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
    roles: string[];
  };
};

@Controller()
@UseGuards(JwtAuthGuard)
export class GatesController {
  constructor(
    private readonly gatesService: GatesService,
  ) {}

  @Post('events/:eventId/gates')
  createGate(
    @Param('eventId') eventId: string,
    @Body() dto: CreateGateDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.gatesService.createGate(
      request.user.userId,
      eventId,
      dto,
    );
  }

  @Get('events/:eventId/gates')
  getEventGates(
    @Param('eventId') eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.gatesService.getEventGates(
      request.user.userId,
      eventId,
    );
  }

  // Gate traffic predictions for an event
  @Get('events/:eventId/gate-predictions')
  getGateTrafficPredictions(
    @Param('eventId') eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.gatesService.getGateTrafficPredictions(
      request.user.userId,
      eventId,
    );
  }

  @Get('gates/:gateId')
  getGate(
    @Param('gateId') gateId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.gatesService.getGate(
      request.user.userId,
      gateId,
    );
  }

  @Patch('gates/:gateId')
  updateGate(
    @Param('gateId') gateId: string,
    @Body() dto: UpdateGateDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.gatesService.updateGate(
      request.user.userId,
      gateId,
      dto,
    );
  }

  @Patch('gates/:gateId/deactivate')
  deactivateGate(
    @Param('gateId') gateId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.gatesService.deactivateGate(
      request.user.userId,
      gateId,
    );
  }
}

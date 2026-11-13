
import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { LiveEntryStatusService } from './live-entry-status.service';

@Controller('events')
export class LiveEntryStatusController {
  constructor(
    private readonly liveEntryStatusService: LiveEntryStatusService,
  ) {}

  @Get(':eventId/live-entry-status')
  getLiveEntryStatus(
    @Param('eventId') eventId: string,
  ) {
    return this.liveEntryStatusService.getEventStatus(eventId);
  }
}

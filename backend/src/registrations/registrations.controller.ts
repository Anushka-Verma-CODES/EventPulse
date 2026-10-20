
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RegistrationsService } from "./registrations.service";

@Controller("registrations")
@UseGuards(JwtAuthGuard)
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Post()
  register(
    @Req() request: { user: { userId: string } },
    @Body() body: { eventId: string },
  ) {
    return this.registrationsService.register(
      request.user.userId,
      body.eventId,
    );
  }

  @Get("my-registrations")
  getMyRegistrations(
    @Req() request: { user: { userId: string } },
  ) {
    return this.registrationsService.getMyRegistrations(
      request.user.userId,
    );
  }
}

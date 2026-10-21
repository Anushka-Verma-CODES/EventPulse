import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/users.service";
import { UserRole } from "../users/enums/user-role.enum";
import { RegistrationsService } from "./registrations.service";

@Controller("registrations")
@UseGuards(JwtAuthGuard)
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
    private readonly usersService: UsersService,
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

  @Post("check-in")
  async checkIn(
    @Req() request: { user: { userId: string } },
    @Body() body: { qrToken: string },
  ) {
    const hasScannerRole = await this.usersService.hasRole(
      request.user.userId,
      UserRole.SCANNER_STAFF,
    );

    if (!hasScannerRole) {
      throw new ForbiddenException(
        "Only authorized scanner staff can check in tickets",
      );
    }

    return this.registrationsService.checkIn(body.qrToken);
  }

    @Get("organizer/dashboard-stats")
  async getOrganizerDashboardStats(
    @Req() request: { user: { userId: string } },
  ) {
    const hasOrganizerRole = await this.usersService.hasRole(
      request.user.userId,
      UserRole.ORGANIZER,
    );

    if (!hasOrganizerRole) {
      throw new ForbiddenException(
        "Only organizers can view dashboard statistics.",
      );
    }

    return this.registrationsService.getOrganizerDashboardStats(
      request.user.userId,
    );
  }

  
  @Get("organizer/event-registration-counts")
  async getOrganizerEventRegistrationCounts(
    @Req() request: { user: { userId: string } },
  ) {
    const hasOrganizerRole = await this.usersService.hasRole(
      request.user.userId,
      UserRole.ORGANIZER,
    );

    if (!hasOrganizerRole) {
      throw new ForbiddenException(
        "Only organizers can view event registration counts.",
      );
    }

    return this.registrationsService.getOrganizerEventRegistrationCounts(
      request.user.userId,
    );
  }

  
@Get("organizer/attendees")
async getOrganizerAttendees(
  @Req() request: { user: { userId: string } },
) {
  const hasOrganizerRole = await this.usersService.hasRole(
    request.user.userId,
    UserRole.ORGANIZER,
  );

  if (!hasOrganizerRole) {
    throw new ForbiddenException(
      "Only organizers can view their event attendees.",
    );
  }

  return this.registrationsService.getOrganizerAttendees(
    request.user.userId,
  );
}

}


import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { VolunteersService } from './volunteers.service';
import {
  CreateVolunteerAssignmentDto,
  UpdateVolunteerAssignmentDto,
} from './dto/create-volunteer-assignment.dto';
import { UpdateVolunteerProfileDto } from '../auth/dto/update-volunteer-profile.dto';
import { VolunteerApplicationStatus } from './entities/volunteer-application.entity';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    roles: string[];
  };
}

@Controller('volunteers')
@UseGuards(JwtAuthGuard)
export class VolunteersController {
  constructor(
    private readonly volunteersService: VolunteersService,
    private readonly usersService: UsersService,
  ) {}

  private async ensureVolunteerRole(userId: string): Promise<void> {
    const hasVolunteerRole = await this.usersService.hasRole(
      userId,
      UserRole.VOLUNTEER,
    );

    if (!hasVolunteerRole) {
      throw new ForbiddenException(
        'Activate the volunteer role to access this profile.',
      );
    }
  }

  @Get('me')
  async getMyProfile(@Req() request: AuthenticatedRequest) {
    await this.ensureVolunteerRole(request.user.userId);
    return this.volunteersService.getMyProfile(request.user.userId);
  }

  @Patch('me')
  async updateMyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateVolunteerProfileDto,
  ) {
    await this.ensureVolunteerRole(request.user.userId);

    return this.volunteersService.updateMyProfile(
      request.user.userId,
      dto,
    );
  }

  @Get('me/activity')
  async getMyActivity(@Req() request: AuthenticatedRequest) {
    await this.ensureVolunteerRole(request.user.userId);
    return this.volunteersService.getMyActivity(request.user.userId);
  }

  @Get('eligible-volunteers')
async getEligibleVolunteers(
  @Req() request: AuthenticatedRequest,
) {
  const isOrganizer = await this.usersService.hasRole(
    request.user.userId,
    UserRole.ORGANIZER,
  );

  if (!isOrganizer) {
    throw new ForbiddenException(
      'Only organizers can view eligible volunteers.',
    );
  }

  return this.usersService.findVolunteers();
}

  
  @Get('me/applications')
  async getMyApplications(
    @Req() request: AuthenticatedRequest,
  ) {
    await this.ensureVolunteerRole(request.user.userId);

    return this.volunteersService.getMyApplications(
      request.user.userId,
    );
  }


  @Post('applications')
  async applyForEvent(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      eventId: string;
      reason: string;
      availability: string[];
      preferredRole?: string;
    },
  ) {
    await this.ensureVolunteerRole(request.user.userId);

    return this.volunteersService.applyForEvent(
      request.user.userId,
      body,
    );
  }

  
  @Get('organizer/applications')
  async getOrganizerApplications(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.volunteersService.getOrganizerApplications(
      request.user.userId,
    );
  }

  
  @Patch('applications/:id/review')
  async reviewApplication(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) applicationId: string,
    @Body()
    body: {
  status: VolunteerApplicationStatus;
},
  ) {
    return this.volunteersService.reviewApplication(
      request.user.userId,
      applicationId,
      body.status,
    );
  }



  @Post('assignments')
  async createAssignment(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateVolunteerAssignmentDto,
  ) {
    return this.volunteersService.createAssignment(
      request.user.userId,
      dto,
    );
  }

  @Get('organizer/overview')
  async getOrganizerOverview(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.volunteersService.getOrganizerOverview(
      request.user.userId,
    );
  }

    @Get('organizer/assignments')
  async getOrganizerAssignments(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.volunteersService.getOrganizerAssignments(
      request.user.userId,
    );
  }

  @Get('me/assignments')
  async getMyAssignments(@Req() request: AuthenticatedRequest) {
    await this.ensureVolunteerRole(request.user.userId);
    return this.volunteersService.getMyAssignments(request.user.userId);
  }

  @Patch('me/assignments/:id')
  async updateMyAssignment(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) assignmentId: string,
    @Body() dto: UpdateVolunteerAssignmentDto,
  ) {
    await this.ensureVolunteerRole(request.user.userId);

    return this.volunteersService.updateMyAssignment(
      request.user.userId,
      assignmentId,
      dto,
    );
  }

  
  @Post('organizer/events/:eventId/scanners')
  async grantScannerAccess(
  @Req() request: AuthenticatedRequest,
  @Param('eventId', ParseUUIDPipe) eventId: string,
  @Body()
  body: {
    scannerUserId: string;
    startsAt: string;
    endsAt: string;
  },
    ) {
  return this.volunteersService.grantScannerAccess(
    request.user.userId,
    eventId,
    body.scannerUserId,
    body.startsAt,
    body.endsAt,
  );
}

  @Get('organizer/events/:eventId/scanners')
  async getEventScanners(
    @Req() request: AuthenticatedRequest,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.volunteersService.getEventScanners(
      request.user.userId,
      eventId,
    );
  }

  @Delete(
    'organizer/events/:eventId/scanners/:scannerUserId',
  )
  async revokeScannerAccess(
    @Req() request: AuthenticatedRequest,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('scannerUserId', ParseUUIDPipe) scannerUserId: string,
  ) {
    return this.volunteersService.revokeScannerAccess(
      request.user.userId,
      eventId,
      scannerUserId,
    );
  }

  @Get('scanner/me/events')
async getMyScannerEvents(
  @Req() request: AuthenticatedRequest,
) {
  return this.volunteersService.getMyScannerEvents(
    request.user.userId,
  );
}


}

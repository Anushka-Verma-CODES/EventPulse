
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerProfile } from './entities/volunteer-profile.entity';
import {
  VolunteerAssignment,
  VolunteerAssignmentStatus,
} from './entities/volunteer-assignment.entity';
import {
  VolunteerApplication,
  VolunteerApplicationStatus,
} from './entities/volunteer-application.entity';
import { Event } from '../events/entities/event.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { ScannerEventAssignment } from './entities/scanner-event-assignment.entity';
import { NotificationsService } from '../notifications/notifications.service';

export interface UpdateVolunteerProfileInput {
  skills?: string[];
  preferredRoles?: string[];
  availability?: string[];
}

export interface VolunteerActivityStats {
  eventsCompleted: number;
  totalVolunteerHours: number;
  activeAssignments: number;
}

export interface CreateVolunteerAssignmentInput {
  volunteerId: string;
  eventId: string;
  assignedRole: string;
}

export interface UpdateVolunteerAssignmentInput {
  status: VolunteerAssignmentStatus;
  hoursWorked?: number;
}

export interface ApplyForEventInput {
  eventId: string;
  reason: string;
  availability: string[];
}

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(VolunteerProfile)
    private readonly volunteerProfileRepository: Repository<VolunteerProfile>,

    @InjectRepository(VolunteerAssignment)
    private readonly volunteerAssignmentRepository: Repository<VolunteerAssignment>,

    @InjectRepository(VolunteerApplication)
    private readonly volunteerApplicationRepository: Repository<VolunteerApplication>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(ScannerEventAssignment)
    private readonly scannerEventAssignmentRepository: Repository<ScannerEventAssignment>,

    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getMyProfile(userId: string): Promise<VolunteerProfile> {
    let profile = await this.volunteerProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.volunteerProfileRepository.create({
        userId,
        skills: [],
        preferredRoles: [],
        availability: [],
      });

      profile = await this.volunteerProfileRepository.save(profile);
    }

    return profile;
  }

  async updateMyProfile(
    userId: string,
    input: UpdateVolunteerProfileInput,
  ): Promise<VolunteerProfile> {
    const profile = await this.getMyProfile(userId);

    if (input.skills !== undefined) {
      profile.skills = input.skills;
    }

    if (input.preferredRoles !== undefined) {
      profile.preferredRoles = input.preferredRoles;
    }

    if (input.availability !== undefined) {
      profile.availability = input.availability;
    }

    return this.volunteerProfileRepository.save(profile);
  }

  async applyForEvent(
    volunteerId: string,
    input: ApplyForEventInput,
  ): Promise<VolunteerApplication> {
    const isVolunteer = await this.usersService.hasRole(
      volunteerId,
      UserRole.VOLUNTEER,
    );

    if (!isVolunteer) {
      throw new ForbiddenException(
        'Activate the volunteer role to apply for events.',
      );
    }

    const event = await this.eventRepository.findOne({
      where: { id: input.eventId },
    });

    if (!event || event.status !== 'published') {
      throw new NotFoundException('Published event not found.');
    }

    if (
      typeof input.reason !== 'string' ||
      !input.reason.trim()
    ) {
      throw new BadRequestException(
        'Please provide a reason for volunteering.',
      );
    }

    const validAvailability = ['Morning', 'Afternoon', 'Evening'];

    if (
      !Array.isArray(input.availability) ||
      input.availability.length === 0 ||
      input.availability.some(
        (option) => !validAvailability.includes(option),
      )
    ) {
      throw new BadRequestException(
        'Select at least one valid availability option.',
      );
    }

    const existingApplication =
      await this.volunteerApplicationRepository.findOne({
        where: {
          volunteerId,
          eventId: input.eventId,
        },
      });

    if (existingApplication) {
      throw new ConflictException(
        'You have already applied to this event.',
      );
    }

    const application = this.volunteerApplicationRepository.create({
      volunteerId,
      eventId: input.eventId,
      reason: input.reason.trim(),
      availability: input.availability,
      status: VolunteerApplicationStatus.PENDING,
    });

    const savedApplication =
  await this.volunteerApplicationRepository.save(application);

  await this.notificationsService.create(event.organizerId, {
  title: 'New volunteer application',
  message: `A volunteer has applied for "${event.title}". Review the application in your organizer dashboard.`,
  type: 'volunteer_application',
  link: '/organizer/volunteers',
  });

  return savedApplication;
  }

  async getMyApplications(
    volunteerId: string,
  ): Promise<VolunteerApplication[]> {
    return this.volunteerApplicationRepository.find({
      where: { volunteerId },
      relations: { event: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrganizerApplications(
    organizerId: string,
  ): Promise<VolunteerApplication[]> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Activate the organizer role to view volunteer applications.',
      );
    }

    return this.volunteerApplicationRepository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.event', 'event')
      .innerJoinAndSelect('application.volunteer', 'volunteer')
      .where('event.organizerId = :organizerId', { organizerId })
      .orderBy('application.createdAt', 'DESC')
      .getMany();
  }

  async reviewApplication(
    organizerId: string,
    applicationId: string,
    status: VolunteerApplicationStatus,
  ): Promise<VolunteerApplication> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Only organizers can review volunteer applications.',
      );
    }

    if (
      status !== VolunteerApplicationStatus.ACCEPTED &&
      status !== VolunteerApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Application status must be accepted or rejected.',
      );
    }

    const application =
      await this.volunteerApplicationRepository.findOne({
        where: { id: applicationId },
        relations: { event: true },
      });

    if (!application) {
      throw new NotFoundException('Volunteer application not found.');
    }

    if (application.event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only review applications for your own events.',
      );
    }

    if (application.status !== VolunteerApplicationStatus.PENDING) {
      throw new BadRequestException(
        'This application has already been reviewed.',
      );
    }

    
application.status = status;

const savedApplication =
  await this.volunteerApplicationRepository.save(application);

await this.notificationsService.create(application.volunteerId, {
  title:
    status === VolunteerApplicationStatus.ACCEPTED
      ? "Volunteer application accepted"
      : "Volunteer application rejected",
  message:
    status === VolunteerApplicationStatus.ACCEPTED
      ? `Your application for "${application.event.title}" has been accepted.`
      : `Your application for "${application.event.title}" has been rejected.`,
  type: "volunteer_application",
  link: "/volunteer/applications",
});

return savedApplication;

  }

  async createAssignment(
    organizerId: string,
    input: CreateVolunteerAssignmentInput,
  ): Promise<VolunteerAssignment> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Activate the organizer role to assign volunteers.',
      );
    }

    const event = await this.eventRepository.findOne({
      where: { id: input.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only assign volunteers to your own events.',
      );
    }

    const isVolunteer = await this.usersService.hasRole(
      input.volunteerId,
      UserRole.VOLUNTEER,
    );

    if (!isVolunteer) {
      throw new BadRequestException(
        'The selected user has not activated the volunteer role.',
      );
    }

    const acceptedApplication =
      await this.volunteerApplicationRepository.findOne({
        where: {
          volunteerId: input.volunteerId,
          eventId: input.eventId,
          status: VolunteerApplicationStatus.ACCEPTED,
        },
      });

    if (!acceptedApplication) {
      throw new BadRequestException(
        'You can only assign tasks to volunteers whose applications have been accepted for this event.',
      );
    }

    const existingAssignment =
      await this.volunteerAssignmentRepository.findOne({
        where: {
          volunteerId: input.volunteerId,
          eventId: input.eventId,
        },
      });

    if (
      existingAssignment &&
      existingAssignment.status !== VolunteerAssignmentStatus.CANCELLED
    ) {
      throw new ConflictException(
        'This volunteer is already assigned to the event.',
      );
    }

    if (existingAssignment) {
      existingAssignment.assignedRole = input.assignedRole;
      existingAssignment.status = VolunteerAssignmentStatus.ASSIGNED;
      existingAssignment.hoursWorked = '0';
      existingAssignment.completedAt = null;

      return this.volunteerAssignmentRepository.save(existingAssignment);
    }

    const assignment = this.volunteerAssignmentRepository.create({
      volunteerId: input.volunteerId,
      eventId: input.eventId,
      assignedRole: input.assignedRole,
      status: VolunteerAssignmentStatus.ASSIGNED,
      hoursWorked: '0',
      completedAt: null,
    });

    return this.volunteerAssignmentRepository.save(assignment);
  }

  async getOrganizerAssignments(
    organizerId: string,
  ): Promise<VolunteerAssignment[]> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Activate the organizer role to view volunteer assignments.',
      );
    }

    return this.volunteerAssignmentRepository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.event', 'event')
      .leftJoinAndSelect('assignment.volunteer', 'volunteer')
      .where('event.organizerId = :organizerId', { organizerId })
      .orderBy('assignment.createdAt', 'DESC')
      .getMany();
  }

  async getMyAssignments(
    volunteerId: string,
  ): Promise<VolunteerAssignment[]> {
    return this.volunteerAssignmentRepository.find({
      where: { volunteerId },
      relations: { event: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateMyAssignment(
    volunteerId: string,
    assignmentId: string,
    input: UpdateVolunteerAssignmentInput,
  ): Promise<VolunteerAssignment> {
    const assignment = await this.volunteerAssignmentRepository.findOne({
      where: {
        id: assignmentId,
        volunteerId,
      },
      relations: { event: true },
    });

    if (!assignment) {
      throw new NotFoundException('Volunteer assignment not found.');
    }

    if (
      assignment.status === VolunteerAssignmentStatus.COMPLETED ||
      assignment.status === VolunteerAssignmentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'This assignment can no longer be updated.',
      );
    }

    if (
      input.status !== VolunteerAssignmentStatus.IN_PROGRESS &&
      input.status !== VolunteerAssignmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'You can only mark an assignment as in progress or completed.',
      );
    }

    if (input.hoursWorked !== undefined) {
      assignment.hoursWorked = String(input.hoursWorked);
    }

    assignment.status = input.status;

    if (input.status === VolunteerAssignmentStatus.COMPLETED) {
      assignment.completedAt = new Date();
    }

    return this.volunteerAssignmentRepository.save(assignment);
  }

  async getMyActivity(
    userId: string,
  ): Promise<VolunteerActivityStats> {
    const completedAssignments =
      await this.volunteerAssignmentRepository.find({
        where: {
          volunteerId: userId,
          status: VolunteerAssignmentStatus.COMPLETED,
        },
        select: {
          eventId: true,
          hoursWorked: true,
        },
      });

    const eventsCompleted = new Set(
      completedAssignments.map((assignment) => assignment.eventId),
    ).size;

    const totalVolunteerHours = completedAssignments.reduce(
      (total, assignment) => total + Number(assignment.hoursWorked),
      0,
    );

    const activeAssignments =
      await this.volunteerAssignmentRepository.count({
        where: [
          {
            volunteerId: userId,
            status: VolunteerAssignmentStatus.ASSIGNED,
          },
          {
            volunteerId: userId,
            status: VolunteerAssignmentStatus.IN_PROGRESS,
          },
        ],
      });

    return {
      eventsCompleted,
      totalVolunteerHours: Number(totalVolunteerHours.toFixed(2)),
      activeAssignments,
    };
  }

  async getOrganizerOverview(organizerId: string) {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Activate the organizer role to view volunteer statistics.',
      );
    }

    const [
      applications,
      assignments,
    ] = await Promise.all([
      this.volunteerApplicationRepository
        .createQueryBuilder('application')
        .innerJoin('application.event', 'event')
        .select('application.volunteerId', 'volunteerId')
        .addSelect('application.status', 'status')
        .where('event.organizerId = :organizerId', {
          organizerId,
        })
        .getRawMany<{
          volunteerId: string;
          status: string;
        }>(),

      this.volunteerAssignmentRepository
        .createQueryBuilder('assignment')
        .innerJoin('assignment.event', 'event')
        .select('assignment.volunteerId', 'volunteerId')
        .addSelect('assignment.status', 'status')
        .where('event.organizerId = :organizerId', {
          organizerId,
        })
        .getRawMany<{
          volunteerId: string;
          status: VolunteerAssignmentStatus;
        }>(),
    ]);

    const volunteerIds = new Set<string>();

    applications.forEach((application) => {
      volunteerIds.add(application.volunteerId);
    });

    assignments.forEach((assignment) => {
      volunteerIds.add(assignment.volunteerId);
    });

    return {
      totalVolunteers: volunteerIds.size,

      pendingApplications: applications.filter(
        (application) => application.status === 'pending',
      ).length,

      activeAssignments: assignments.filter(
        (assignment) =>
          assignment.status === VolunteerAssignmentStatus.ASSIGNED ||
          assignment.status === VolunteerAssignmentStatus.IN_PROGRESS,
      ).length,

      completedTasks: assignments.filter(
        (assignment) =>
          assignment.status === VolunteerAssignmentStatus.COMPLETED,
      ).length,
    };
  }

  
  async grantScannerAccess(
    organizerId: string,
    eventId: string,
    scannerUserId: string,
  ): Promise<ScannerEventAssignment> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Only organizers can grant scanner access.',
      );
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only manage scanners for your own events.',
      );
    }

    const isVolunteer = await this.usersService.hasRole(
      scannerUserId,
      UserRole.VOLUNTEER,
    );

    if (!isVolunteer) {
      throw new BadRequestException(
        'The selected user must have the Volunteer role.',
      );
    }

    const acceptedApplication =
      await this.volunteerApplicationRepository.findOne({
        where: {
          volunteerId: scannerUserId,
          eventId,
          status: VolunteerApplicationStatus.ACCEPTED,
        },
      });

    if (!acceptedApplication) {
      throw new BadRequestException(
        'The volunteer must have an accepted application for this event.',
      );
    }

    let assignment =
      await this.scannerEventAssignmentRepository.findOne({
        where: { eventId, scannerUserId },
      });

    if (assignment?.isActive) {
      throw new ConflictException(
        'This volunteer already has scanner access for this event.',
      );
    }

    if (assignment) {
      assignment.isActive = true;
      assignment.assignedByOrganizerId = organizerId;
    } else {
      assignment = this.scannerEventAssignmentRepository.create({
        eventId,
        scannerUserId,
        assignedByOrganizerId: organizerId,
        isActive: true,
      });
    }

    return this.scannerEventAssignmentRepository.save(assignment);
  }

  async getEventScanners(
    organizerId: string,
    eventId: string,
  ): Promise<ScannerEventAssignment[]> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Only organizers can view event scanner assignments.',
      );
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only view scanners for your own events.',
      );
    }

    return this.scannerEventAssignmentRepository.find({
      where: { eventId, isActive: true },
      relations: { scanner: true },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeScannerAccess(
    organizerId: string,
    eventId: string,
    scannerUserId: string,
  ): Promise<{ message: string }> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Only organizers can revoke scanner access.',
      );
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only manage scanners for your own events.',
      );
    }

    const assignment =
      await this.scannerEventAssignmentRepository.findOne({
        where: { eventId, scannerUserId, isActive: true },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Active scanner assignment not found.',
      );
    }

    assignment.isActive = false;
    await this.scannerEventAssignmentRepository.save(assignment);

    return { message: 'Scanner access revoked successfully.' };
  }

  async getMyScannerEvents(
  scannerUserId: string,
): Promise<ScannerEventAssignment[]> {
  const isScanner = await this.usersService.hasRole(
    scannerUserId,
    UserRole.SCANNER_STAFF,
  );

  if (!isScanner) {
    throw new ForbiddenException(
      'Only users with the Scanner role can view assigned events.',
    );
  }

  return this.scannerEventAssignmentRepository.find({
    where: {
      scannerUserId,
      isActive: true,
    },
    relations: {
      event: true,
    },
    order: {
      createdAt: 'DESC',
    },
  });
}

}

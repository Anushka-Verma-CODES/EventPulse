
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
  VolunteerHoursApprovalStatus,
} from './entities/volunteer-assignment.entity';
import {
  VolunteerApplication,
  VolunteerApplicationStatus,
} from './entities/volunteer-application.entity';
import { Event } from '../events/entities/event.entity';
import { EventGate } from '../gates/entities/event-gate.entity';
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
  scheduledStartAt: string;
  scheduledEndAt: string;
}

export interface UpdateVolunteerAssignmentInput {
  status: VolunteerAssignmentStatus;
}

export interface ApplyForEventInput {
  eventId: string;
  reason: string;
  availability: string[];
  preferredRole?: string;
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

    @InjectRepository(EventGate)
    private readonly eventGateRepository: Repository<EventGate>,

    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async reviewVolunteerHours(
    organizerId: string,
    assignmentId: string,
    status: VolunteerHoursApprovalStatus,
  ): Promise<VolunteerAssignment> {
    const isOrganizer = await this.usersService.hasRole(
      organizerId,
      UserRole.ORGANIZER,
    );

    if (!isOrganizer) {
      throw new ForbiddenException(
        'Only organizers can review volunteer working hours.',
      );
    }

    if (
      status !== VolunteerHoursApprovalStatus.APPROVED &&
      status !== VolunteerHoursApprovalStatus.FLAGGED
    ) {
      throw new BadRequestException(
        'Hours can only be approved or flagged.',
      );
    }

    const assignment =
      await this.volunteerAssignmentRepository.findOne({
        where: { id: assignmentId },
        relations: {
          event: true,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Volunteer assignment not found.',
      );
    }

    if (assignment.event.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only review hours for your own events.',
      );
    }

    if (assignment.status !== VolunteerAssignmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Only completed volunteer assignments can have their hours reviewed.',
      );
    }

    assignment.hoursApprovalStatus = status;

    return this.volunteerAssignmentRepository.save(assignment);
  }

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

    if (typeof input.reason !== 'string' || !input.reason.trim()) {
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

    const preferredRole = input.preferredRole ?? 'Any Role';

    if (!['Scanner', 'Any Role'].includes(preferredRole)) {
      throw new BadRequestException(
        'Preferred role must be Scanner or Any Role.',
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
      preferredRole,
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
          ? 'Volunteer application accepted'
          : 'Volunteer application rejected',
      message:
        status === VolunteerApplicationStatus.ACCEPTED
          ? `Your application for "${application.event.title}" has been accepted.`
          : `Your application for "${application.event.title}" has been rejected.`,
      type: 'volunteer_application',
      link: '/volunteer/applications',
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

    const scheduledStartAt = new Date(input.scheduledStartAt);
    const scheduledEndAt = new Date(input.scheduledEndAt);

    if (
      Number.isNaN(scheduledStartAt.getTime()) ||
      Number.isNaN(scheduledEndAt.getTime()) ||
      scheduledEndAt <= scheduledStartAt
    ) {
      throw new BadRequestException(
        'Please provide a valid shift start and end time.',
      );
    }

    if (
      scheduledStartAt < new Date(event.startDate) ||
      scheduledEndAt > new Date(event.endDate)
    ) {
      throw new BadRequestException(
        'The volunteer shift must fall within the event dates and times.',
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
      existingAssignment.status !== VolunteerAssignmentStatus.CANCELLED &&
      existingAssignment.status !== VolunteerAssignmentStatus.DECLINED
    ) {
      throw new ConflictException(
        'This volunteer is already assigned to the event.',
      );
    }

    const overlappingAssignment =
      await this.volunteerAssignmentRepository
        .createQueryBuilder('assignment')
        .where('assignment.volunteerId = :volunteerId', {
          volunteerId: input.volunteerId,
        })
        .andWhere('assignment.scheduledStartAt < :scheduledEndAt', {
          scheduledEndAt,
        })
        .andWhere('assignment.scheduledEndAt > :scheduledStartAt', {
          scheduledStartAt,
        })
        .andWhere('assignment.status NOT IN (:...ignoredStatuses)', {
          ignoredStatuses: [
            VolunteerAssignmentStatus.DECLINED,
            VolunteerAssignmentStatus.CANCELLED,
          ],
        })
        .getOne();

    if (overlappingAssignment) {
      throw new ConflictException(
        'This volunteer already has another assignment scheduled during this time.',
      );
    }

    if (existingAssignment) {
      existingAssignment.assignedRole = input.assignedRole;
      existingAssignment.status =
        VolunteerAssignmentStatus.PENDING_ACCEPTANCE;
      existingAssignment.scheduledStartAt = scheduledStartAt;
      existingAssignment.scheduledEndAt = scheduledEndAt;
      existingAssignment.actualStartedAt = null;
      existingAssignment.actualEndedAt = null;
      existingAssignment.hoursWorked = '0';
      existingAssignment.completedAt = null;

      return this.volunteerAssignmentRepository.save(existingAssignment);
    }

    const assignment = this.volunteerAssignmentRepository.create({
      volunteerId: input.volunteerId,
      eventId: input.eventId,
      assignedRole: input.assignedRole,
      status: VolunteerAssignmentStatus.PENDING_ACCEPTANCE,
      scheduledStartAt,
      scheduledEndAt,
      actualStartedAt: null,
      actualEndedAt: null,
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

    const now = new Date();

    // Step 1: Accept the assignment.
    if (input.status === VolunteerAssignmentStatus.ACCEPTED) {
      if (
        assignment.status !==
        VolunteerAssignmentStatus.PENDING_ACCEPTANCE
      ) {
        throw new BadRequestException(
          'This assignment cannot be accepted in its current state.',
        );
      }

      if (!assignment.scheduledStartAt || !assignment.scheduledEndAt) {
        throw new BadRequestException(
          'This assignment does not have a valid scheduled shift.',
        );
      }

      const overlappingAssignment =
        await this.volunteerAssignmentRepository
          .createQueryBuilder('other')
          .where('other.volunteerId = :volunteerId', { volunteerId })
          .andWhere('other.id != :assignmentId', { assignmentId })
          .andWhere('other.scheduledStartAt < :scheduledEndAt', {
            scheduledEndAt: assignment.scheduledEndAt,
          })
          .andWhere('other.scheduledEndAt > :scheduledStartAt', {
            scheduledStartAt: assignment.scheduledStartAt,
          })
          .andWhere('other.status NOT IN (:...ignoredStatuses)', {
            ignoredStatuses: [
              VolunteerAssignmentStatus.DECLINED,
              VolunteerAssignmentStatus.CANCELLED,
            ],
          })
          .getOne();

      if (overlappingAssignment) {
        throw new ConflictException(
          'You already have another assignment scheduled during this time. You cannot accept overlapping shifts.',
        );
      }

      assignment.status = VolunteerAssignmentStatus.ACCEPTED;

      return this.volunteerAssignmentRepository.save(assignment);
    }

    // Step 2: Start the shift.
    if (input.status === VolunteerAssignmentStatus.IN_PROGRESS) {
      if (assignment.status !== VolunteerAssignmentStatus.ACCEPTED) {
        throw new BadRequestException(
          'You must accept this assignment before starting your shift.',
        );
      }

      if (!assignment.scheduledStartAt || !assignment.scheduledEndAt) {
        throw new BadRequestException(
          'This assignment does not have a valid scheduled shift.',
        );
      }

      if (now < assignment.scheduledStartAt) {
        throw new BadRequestException(
          'You cannot start your shift before its scheduled start time.',
        );
      }

      if (now >= assignment.scheduledEndAt) {
        throw new BadRequestException(
          'The scheduled shift has already ended.',
        );
      }

      assignment.actualStartedAt = now;
      assignment.actualEndedAt = null;
      assignment.status = VolunteerAssignmentStatus.IN_PROGRESS;

      return this.volunteerAssignmentRepository.save(assignment);
    }

    // Step 3: End the shift and calculate hours automatically.
    if (input.status === VolunteerAssignmentStatus.COMPLETED) {
      if (assignment.status !== VolunteerAssignmentStatus.IN_PROGRESS) {
        throw new BadRequestException(
          'You must start your shift before ending it.',
        );
      }

      if (!assignment.actualStartedAt) {
        throw new BadRequestException(
          'The shift start time could not be found.',
        );
      }

      if (now <= assignment.actualStartedAt) {
        throw new BadRequestException(
          'The shift end time must be after its start time.',
        );
      }

      const elapsedMilliseconds =
        now.getTime() - assignment.actualStartedAt.getTime();

      const calculatedHours = elapsedMilliseconds / (1000 * 60 * 60);

      assignment.actualEndedAt = now;
      assignment.hoursWorked = calculatedHours.toFixed(2);
      assignment.status = VolunteerAssignmentStatus.COMPLETED;
      assignment.completedAt = now;

      assignment.hoursApprovalStatus =
        assignment.scheduledEndAt &&
        now > assignment.scheduledEndAt
          ? VolunteerHoursApprovalStatus.FLAGGED
          : VolunteerHoursApprovalStatus.PENDING;

      return this.volunteerAssignmentRepository.save(assignment);
    }

    // Step 4: Decline a pending assignment.
    if (input.status === VolunteerAssignmentStatus.DECLINED) {
      if (
        assignment.status !==
        VolunteerAssignmentStatus.PENDING_ACCEPTANCE
      ) {
        throw new BadRequestException(
          'Only pending assignments can be declined.',
        );
      }

      assignment.status = VolunteerAssignmentStatus.DECLINED;

      return this.volunteerAssignmentRepository.save(assignment);
    }

    throw new BadRequestException(
      'Invalid assignment action.',
    );
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
          hoursApprovalStatus: true,
        },
      });

    const eventsCompleted = new Set(
      completedAssignments.map((assignment) => assignment.eventId),
    ).size;

    const totalVolunteerHours = completedAssignments.reduce(
      (total, assignment) => {
        if (
          assignment.hoursApprovalStatus !==
          VolunteerHoursApprovalStatus.APPROVED
        ) {
          return total;
        }

        return total + Number(assignment.hoursWorked);
      },
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

    const [applications, assignments] = await Promise.all([
      this.volunteerApplicationRepository
        .createQueryBuilder('application')
        .innerJoin('application.event', 'event')
        .select('application.volunteerId', 'volunteerId')
        .addSelect('application.status', 'status')
        .where('event.organizerId = :organizerId', { organizerId })
        .getRawMany<{
          volunteerId: string;
          status: string;
        }>(),

      this.volunteerAssignmentRepository
        .createQueryBuilder('assignment')
        .innerJoin('assignment.event', 'event')
        .select('assignment.volunteerId', 'volunteerId')
        .addSelect('assignment.status', 'status')
        .where('event.organizerId = :organizerId', { organizerId })
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
    gateId: string,
    startsAt: string,
    endsAt: string,
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

    if (!gateId) {
      throw new BadRequestException('A gate must be selected.');
    }

    const gate = await this.eventGateRepository.findOne({
      where: {
        id: gateId,
        eventId,
        isActive: true,
      },
    });

    if (!gate) {
      throw new BadRequestException(
        'Select an active gate belonging to this event.',
      );
    }

    if (!startsAt || !endsAt) {
      throw new BadRequestException(
        'Scanner access start and end times are required.',
      );
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate.getTime() <= startDate.getTime()
    ) {
      throw new BadRequestException(
        'A valid start time and an end time after the start are required.',
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

    let assignment = await this.scannerEventAssignmentRepository.findOne({
      where: { eventId, scannerUserId },
    });

    if (assignment?.isActive) {
      throw new ConflictException(
        'This volunteer already has scanner access for this event. Revoke the existing access before assigning again.',
      );
    }

    if (assignment) {
      assignment.isActive = true;
      assignment.assignedByOrganizerId = organizerId;
      assignment.gateId = gate.id;
      assignment.startsAt = startDate;
      assignment.endsAt = endDate;
    } else {
      assignment = this.scannerEventAssignmentRepository.create({
        eventId,
        scannerUserId,
        gateId: gate.id,
        assignedByOrganizerId: organizerId,
        isActive: true,
        startsAt: startDate,
        endsAt: endDate,
      });
    }

    const savedAssignment =
      await this.scannerEventAssignmentRepository.save(assignment);

    return this.scannerEventAssignmentRepository.findOneOrFail({
      where: { id: savedAssignment.id },
      relations: {
        scanner: true,
        event: true,
        gate: true,
      },
    });
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
      relations: {
        scanner: true,
        gate: true,
      },
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
    const isVolunteer = await this.usersService.hasRole(
      scannerUserId,
      UserRole.VOLUNTEER,
    );

    if (!isVolunteer) {
      throw new ForbiddenException(
        'Only volunteers can view their assigned scanner events.',
      );
    }

    return this.scannerEventAssignmentRepository.find({
      where: {
        scannerUserId,
        isActive: true,
      },
      relations: {
        event: true,
        gate: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}

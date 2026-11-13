
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { VolunteerAssignmentStatus } from '../entities/volunteer-assignment.entity';

export class CreateVolunteerAssignmentDto {
  @IsUUID()
  volunteerId: string;

  @IsUUID()
  eventId: string;

  @IsString()
  @MaxLength(100)
  assignedRole: string;

  @IsDateString()
  scheduledStartAt: string;

  @IsDateString()
  scheduledEndAt: string;
}

export class UpdateVolunteerAssignmentDto {
  @IsEnum(VolunteerAssignmentStatus)
  status: VolunteerAssignmentStatus;
}

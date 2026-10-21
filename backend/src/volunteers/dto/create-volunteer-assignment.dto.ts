
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
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
}

export class UpdateVolunteerAssignmentDto {
  @IsEnum(VolunteerAssignmentStatus)
  status: VolunteerAssignmentStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9999)
  hoursWorked?: number;
}

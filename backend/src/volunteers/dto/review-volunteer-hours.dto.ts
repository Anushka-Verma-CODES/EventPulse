import { IsEnum } from 'class-validator';
import { VolunteerHoursApprovalStatus } from '../entities/volunteer-assignment.entity';

export class ReviewVolunteerHoursDto {
  @IsEnum(VolunteerHoursApprovalStatus)
  status: VolunteerHoursApprovalStatus;
}
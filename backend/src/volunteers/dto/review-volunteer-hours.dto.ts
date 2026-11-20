import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VolunteerHoursApprovalStatus } from '../entities/volunteer-assignment.entity';

export class ReviewVolunteerHoursDto {
  @IsEnum(VolunteerHoursApprovalStatus)
  status: VolunteerHoursApprovalStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedHours?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  IncidentSeverity,
  IncidentStatus,
} from "../entities/incident.entity";

export class UpdateIncidentDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @IsString()
  @MaxLength(150)
  @IsOptional()
  location?: string;
}
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  organization?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  academicYear?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
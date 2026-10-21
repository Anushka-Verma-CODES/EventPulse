
import {
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
}


import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message:
      'Gate code can contain only letters, numbers, hyphens and underscores',
  })
  code: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}

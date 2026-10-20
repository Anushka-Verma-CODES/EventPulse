import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
  IsUrl,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsOptional()
  @IsUrl()
  bannerImage?: string;
}

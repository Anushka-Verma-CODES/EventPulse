
import {
  IsInt,
  Min,
} from 'class-validator';

export class UpdateGateThresholdsDto {
  @IsInt()
  @Min(0)
  normalMax: number;

  @IsInt()
  @Min(1)
  moderateMax: number;

  @IsInt()
  @Min(2)
  highMax: number;
}


import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsIn(['English', 'Hindi'])
  language?: 'English' | 'Hindi';

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  eventReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  compactMode?: boolean;

  @IsOptional()
  @IsBoolean()
  soundOnScan?: boolean;

  @IsOptional()
  @IsBoolean()
  vibrationOnScan?: boolean;

  @IsOptional()
  @IsObject()
  notificationPreferences?: Record<string, boolean>;
}

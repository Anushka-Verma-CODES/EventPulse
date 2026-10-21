import { IsIn } from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class ActivateRoleDto {
  @IsIn([
    UserRole.ORGANIZER,
    UserRole.VOLUNTEER,
    UserRole.SCANNER_STAFF,
  ])
  role:
    | UserRole.ORGANIZER
    | UserRole.VOLUNTEER
    | UserRole.SCANNER_STAFF;
}

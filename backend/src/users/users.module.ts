import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRoleAssignment } from './entities/user-role-assignment.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRoleAssignment]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
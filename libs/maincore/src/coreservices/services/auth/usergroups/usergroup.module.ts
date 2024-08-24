import { Module } from '@nestjs/common';
import { UserGroupService } from './usergroup.service';

@Module({
  providers: [UserGroupService],
  exports: [UserGroupService],
})
export class UserGroupModule {}

import { Module } from '@nestjs/common';
import { UserGroupMemberService } from './usergroupmember.service';

@Module({
  providers: [UserGroupMemberService],
  exports: [UserGroupMemberService],
})
export class UserGroupMemberModule {}

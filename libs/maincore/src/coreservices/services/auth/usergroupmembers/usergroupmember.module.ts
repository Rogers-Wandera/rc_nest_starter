import { Module } from '@nestjs/common';
import { UserGroupMemberService } from './usergroupmember.service';
import { UserGroupModule } from '../usergroups/usergroup.module';

@Module({
  imports: [UserGroupModule],
  providers: [UserGroupMemberService],
  exports: [UserGroupMemberService],
})
export class UserGroupMemberModule {}

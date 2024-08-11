import { Module } from '@nestjs/common';
import { UserGroupSupervisorService } from './usergroupsupervisor.service';

@Module({
  providers: [UserGroupSupervisorService],
  exports: [UserGroupSupervisorService],
})
export class UserGroupSupervisorModule {}

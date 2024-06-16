import { Module } from '@nestjs/common';
import { RoleService } from './roles.service';

@Module({
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}

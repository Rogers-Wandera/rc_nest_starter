import { Module } from '@nestjs/common';
import { LinkRoleService } from './linkroles.service';
import { UserModule } from '../users/users.module';
import { ModuleLinksModule } from '../../system/modulelinks/modulelinks.module';

@Module({
  imports: [UserModule, ModuleLinksModule],
  providers: [LinkRoleService],
  exports: [LinkRoleService],
})
export class LinkRoleModule {}

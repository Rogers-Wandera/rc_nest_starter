import { Module } from '@nestjs/common';
import { ModuleLinksModule } from '../modulelinks/modulelinks.module';
import { LinkPermissionService } from './linkpermissions.service';
import { UserModule } from '../../auth/users/users.module';

@Module({
  imports: [ModuleLinksModule, UserModule],
  providers: [LinkPermissionService],
  exports: [LinkPermissionService],
})
export class LinkPermissionModule {}

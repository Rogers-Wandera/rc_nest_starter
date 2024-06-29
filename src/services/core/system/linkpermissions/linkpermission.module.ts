import { Module } from '@nestjs/common';
import { ModuleLinksModule } from '../modulelinks/modulelinks.module';
import { LinkPermissionService } from './linkpermissions.service';
import { LinkPermissionController } from 'src/controllers/core/system/linkpermission/linkpermission.controller';
import { UserModule } from '../../auth/users/users.module';

@Module({
  imports: [ModuleLinksModule, UserModule],
  providers: [LinkPermissionService],
  controllers: [LinkPermissionController],
  exports: [LinkPermissionService],
})
export class LinkPermissionModule {}

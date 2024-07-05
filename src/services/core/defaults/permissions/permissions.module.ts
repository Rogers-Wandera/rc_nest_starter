import { Module } from '@nestjs/common';
import { SystemPermissionsService } from './permissions.service';
import { DiscoveryModule } from '@nestjs/core';
import { MethodPermissions } from './methodpermissions';
import { ModulesModule } from '../../system/modules/modules.module';
import { ModuleLinksModule } from '../../system/modulelinks/modulelinks.module';
import { LinkPermissionModule } from '../../system/linkpermissions/linkpermission.module';

@Module({
  imports: [
    DiscoveryModule,
    ModulesModule,
    ModuleLinksModule,
    LinkPermissionModule,
  ],
  providers: [SystemPermissionsService, MethodPermissions],
  exports: [SystemPermissionsService],
})
export class PermissionsModule {}

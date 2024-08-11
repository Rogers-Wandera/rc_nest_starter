import { Module } from '@nestjs/common';
import { UserModule } from '../users/users.module';
import { LinkPermissionView } from '@entity/entities/coreviews/linkpermissions.view';
import { LinkRoleModule } from '../linkroles/linkroles.module';
import { RolePermissionService } from './rolepermission.service';
import { ServerRouteRoleModule } from '../serverrouteroles/serverrouteroles.module';

@Module({
  imports: [
    UserModule,
    LinkPermissionView,
    LinkRoleModule,
    ServerRouteRoleModule,
  ],
  providers: [RolePermissionService],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}

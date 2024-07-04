import { Module } from '@nestjs/common';
import { UserModule } from '../users/users.module';
import { LinkPermissionView } from 'src/entity/coreviews/linkpermissions.view';
import { LinkRoleModule } from '../linkroles/linkroles.module';
import { RolePermissionService } from './rolepermission.service';
import { RolePermissionController } from 'src/controllers/core/auth/rolepermissions/rolepermissions.controller';
import { ServerRouteRoleModule } from '../serverrouteroles/serverrouteroles.module';

@Module({
  imports: [
    UserModule,
    LinkPermissionView,
    LinkRoleModule,
    ServerRouteRoleModule,
  ],
  providers: [RolePermissionService],
  controllers: [RolePermissionController],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}

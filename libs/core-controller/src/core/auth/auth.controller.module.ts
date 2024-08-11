import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { SystemRolesController } from './systemroles/systemroles.controller';
import { RolePermissionController } from './rolepermissions/rolepermissions.controller';
import { LinkRoleController } from './linkroles/linkroles.controller';

@Module({
  controllers: [
    UsersController,
    SystemRolesController,
    RolePermissionController,
    LinkRoleController,
  ],
})
export class AuthControllerModule {}

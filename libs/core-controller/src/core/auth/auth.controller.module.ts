import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { SystemRolesController } from './systemroles/systemroles.controller';
import { RolePermissionController } from './rolepermissions/rolepermissions.controller';
import { LinkRoleController } from './linkroles/linkroles.controller';
import { UserGroupController } from './usergroups/usergroups.controller';
import { UserGroupMemberController } from './usergroupmembers/usergroupmember.controller';

@Module({
  controllers: [
    UsersController,
    SystemRolesController,
    RolePermissionController,
    LinkRoleController,
    UserGroupController,
    UserGroupMemberController,
  ],
})
export class AuthControllerModule {}

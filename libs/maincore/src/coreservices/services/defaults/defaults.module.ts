import { Global, Module } from '@nestjs/common';
import { PermissionsModule } from './permissions/permissions.module';
import { SystemDefaultRolesModule } from './roles/roles.module';
import { UserModule } from '../auth/users/users.module';

@Global()
@Module({
  imports: [PermissionsModule, SystemDefaultRolesModule, UserModule],
  exports: [PermissionsModule, SystemDefaultRolesModule],
})
export class DefaultsModule {}

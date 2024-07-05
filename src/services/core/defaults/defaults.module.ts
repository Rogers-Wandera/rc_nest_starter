import { Global, Module } from '@nestjs/common';
import { PermissionsModule } from './permissions/permissions.module';
import { DefaultController } from 'src/controllers/core/defaults/default.controller';
import { SystemDefaultRolesModule } from './roles/roles.module';
import { UserModule } from '../auth/users/users.module';

@Global()
@Module({
  imports: [PermissionsModule, SystemDefaultRolesModule, UserModule],
  controllers: [DefaultController],
  exports: [PermissionsModule, SystemDefaultRolesModule],
})
export class DefaultsModule {}

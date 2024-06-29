import { Module } from '@nestjs/common';
import { PositionModule } from './positions/positions.module';
import { ModulesModule } from './modules/modules.module';
import { ModuleLinksModule } from './modulelinks/modulelinks.module';
import { LinkPermissionModule } from './linkpermissions/linkpermission.module';
import { UserModule } from '../auth/users/users.module';

@Module({
  imports: [
    UserModule,
    PositionModule,
    ModulesModule,
    ModuleLinksModule,
    LinkPermissionModule,
  ],
  providers: [],
  exports: [UserModule],
})
export class SystemModule {}

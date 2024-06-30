import { Module } from '@nestjs/common';
import { PositionModule } from './positions/positions.module';
import { ModulesModule } from './modules/modules.module';
import { ModuleLinksModule } from './modulelinks/modulelinks.module';
import { LinkPermissionModule } from './linkpermissions/linkpermission.module';

@Module({
  imports: [
    PositionModule,
    ModulesModule,
    ModuleLinksModule,
    LinkPermissionModule,
  ],
  providers: [],
  exports: [],
})
export class SystemModule {}

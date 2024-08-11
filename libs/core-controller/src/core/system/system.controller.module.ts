import { Module } from '@nestjs/common';
import { LinkPermissionController } from './linkpermission/linkpermission.controller';
import { ModuleLinksController } from './modulelinks/modulelinks.controller';
import { ModulesController } from './modules/modules.controller';
import { PositionController } from './positions/positions.controller';

@Module({
  controllers: [
    LinkPermissionController,
    ModuleLinksController,
    ModulesController,
    PositionController,
  ],
})
export class SystemControllerModule {}

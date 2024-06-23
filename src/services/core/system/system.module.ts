import { Module } from '@nestjs/common';
import { PositionModule } from './positions/positions.module';
import { ModulesModule } from './modules/modules.module';
import { ModuleLinksModule } from './modulelinks/modulelinks.module';

@Module({
  imports: [PositionModule, ModulesModule, ModuleLinksModule],
  providers: [],
  exports: [],
})
export class SystemModule {}

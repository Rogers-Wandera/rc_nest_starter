import { Module } from '@nestjs/common';
import { ModuleLinksService } from './modulelinks.service';
import { ModulesModule } from '../modules/modules.module';
import { ModuleLinksController } from 'src/controllers/core/system/modulelinks/modulelinks.controller';
import { UserModule } from '../../auth/users/users.module';

@Module({
  imports: [ModulesModule, UserModule],
  providers: [ModuleLinksService],
  controllers: [ModuleLinksController],
  exports: [ModuleLinksService],
})
export class ModuleLinksModule {}

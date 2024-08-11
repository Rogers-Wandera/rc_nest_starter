import { Module } from '@nestjs/common';
import { ModuleLinksService } from './modulelinks.service';
import { ModulesModule } from '../modules/modules.module';
import { UserModule } from '../../auth/users/users.module';

@Module({
  imports: [ModulesModule, UserModule],
  providers: [ModuleLinksService],
  exports: [ModuleLinksService],
})
export class ModuleLinksModule {}

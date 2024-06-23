import { Module } from '@nestjs/common';
import { ModuleService } from './modules.service';
import { ModulesController } from 'src/controllers/core/system/modules/modules.controller';
import { UserModule } from '../../auth/users/users.module';

@Module({
  imports: [UserModule],
  providers: [ModuleService],
  controllers: [ModulesController],
  exports: [ModuleService],
})
export class ModulesModule {}

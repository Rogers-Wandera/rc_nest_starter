import { Module } from '@nestjs/common';
import { ModuleService } from './modules.service';
import { UserModule } from '../../auth/users/users.module';

@Module({
  imports: [UserModule],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class ModulesModule {}

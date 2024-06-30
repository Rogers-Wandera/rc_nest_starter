import { Module } from '@nestjs/common';
import { LinkRoleService } from './linkroles.service';
import { UserModule } from '../users/users.module';
import { ModuleLinksModule } from '../../system/modulelinks/modulelinks.module';
import { LinkRoleController } from 'src/controllers/core/auth/linkroles/linkroles.controller';

@Module({
  imports: [UserModule, ModuleLinksModule],
  providers: [LinkRoleService],
  controllers: [LinkRoleController],
  exports: [LinkRoleService],
})
export class LinkRoleModule {}

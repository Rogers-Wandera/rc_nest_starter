import { Module, forwardRef } from '@nestjs/common';
import { SystemRolesService } from './systemroles.service';
import { SystemRolesController } from 'src/controllers/core/auth/systemroles/systemroles.controller';
import { UserModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [SystemRolesService],
  controllers: [SystemRolesController],
  exports: [SystemRolesService],
})
export class SystemRolesModule {}

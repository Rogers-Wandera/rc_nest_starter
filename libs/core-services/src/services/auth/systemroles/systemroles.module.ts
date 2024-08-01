import { Module, forwardRef } from '@nestjs/common';
import { SystemRolesService } from './systemroles.service';
import { UserModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [SystemRolesService],
  exports: [SystemRolesService],
})
export class SystemRolesModule {}

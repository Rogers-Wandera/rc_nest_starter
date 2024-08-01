import { Global, Module } from '@nestjs/common';
import { SystemRolesModule } from '../../auth/systemroles/systemroles.module';
import { SystemDefaultRoles } from './roles.service';

@Global()
@Module({
  imports: [SystemRolesModule],
  providers: [SystemDefaultRoles],
  exports: [SystemDefaultRoles],
})
export class SystemDefaultRolesModule {}

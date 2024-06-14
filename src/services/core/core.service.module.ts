import { Module } from '@nestjs/common';
import { SystemRolesModule } from './auth/systemroles/systemroles.module';

@Module({
  imports: [SystemRolesModule],
})
export class CoreModules {}

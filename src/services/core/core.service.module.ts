import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SystemModule } from './system/system.module';
@Module({
  imports: [AuthModule, SystemModule],
  exports: [AuthModule, SystemModule],
})
export class CoreModules {}

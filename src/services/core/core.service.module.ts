import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SystemModule } from './system/system.module';
import { NotificationModule } from './notifications/notifications.module';
@Module({
  imports: [AuthModule, SystemModule, NotificationModule],
  exports: [AuthModule, SystemModule, NotificationModule],
})
export class CoreModules {}

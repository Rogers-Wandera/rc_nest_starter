import { Module } from '@nestjs/common';
import { AuthControllerModule } from './core/auth/auth.controller.module';
import { SystemControllerModule } from './core/system/system.controller.module';
import { NotificationControllerModule } from './core/notifications/notification.module';
import { DefaultControllerModule } from './core/defaults/defaults.controller.module';

@Module({
  imports: [
    AuthControllerModule,
    SystemControllerModule,
    NotificationControllerModule,
    DefaultControllerModule,
  ],
  providers: [],
})
export class CoreControllerModule {}

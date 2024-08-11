import { Global, Module } from '@nestjs/common';
import { NotificationModule } from './services/notifications/notifications.module';
import { AuthModule } from './services/auth/auth.module';
import { SystemModule } from './services/system/system.module';
import { DefaultsModule } from './services/defaults/defaults.module';
import { CoreToolkitModule } from '@toolkit/core-toolkit';

@Global()
@Module({
  imports: [
    AuthModule,
    SystemModule,
    NotificationModule,
    DefaultsModule,
    CoreToolkitModule,
  ],
  exports: [AuthModule, SystemModule, NotificationModule, DefaultsModule],
})
export class CoreServicesModule {}

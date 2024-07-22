import { Global, Module } from '@nestjs/common';
import { RTechNotifier } from './rtechnotifier.service';
import { RTECHEmailModule } from './mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';
import { envconfig } from './configs/config';
import { RTECHPushNotificationModule } from './pushnotification/push.module';
import { RtechSmsModule } from './smsnotification/sms.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [envconfig],
      cache: true,
    }),
    RTECHEmailModule,
    RTECHPushNotificationModule,
    RtechSmsModule,
  ],
  providers: [RTechNotifier],
  exports: [RTechNotifier],
})
export class RTechNotifierModule {}

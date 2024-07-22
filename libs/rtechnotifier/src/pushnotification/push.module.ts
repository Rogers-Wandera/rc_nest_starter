import { Global, Module } from '@nestjs/common';
import { RTECHPushNotificationService } from './push.service';
import { EventsMoule } from 'src/events/events.module';

@Global()
@Module({
  imports: [EventsMoule],
  providers: [RTECHPushNotificationService],
  exports: [RTECHPushNotificationService],
})
export class RTECHPushNotificationModule {}

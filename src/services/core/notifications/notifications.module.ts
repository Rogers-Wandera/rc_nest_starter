import { Global, Module } from '@nestjs/common';
import { NotificationController } from 'src/controllers/core/notifications/notification.controller';
import { NotificationService } from './notification.service';

@Global()
@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

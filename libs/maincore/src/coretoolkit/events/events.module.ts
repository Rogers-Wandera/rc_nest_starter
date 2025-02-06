import { Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { EventsGateWayService } from './events.service';
import { UserEventsService } from './user_events/userevents.event';
import { DataBridgeModule } from '@core/maincore/databridge/databridge.module';
import { NotificationEvents } from './notifications/notification.event';
import { UploadEvents } from './upload/upload.event';

@Module({
  providers: [
    EventsGateway,
    DataBridgeModule,
    EventsGateWayService,
    UserEventsService,
    NotificationEvents,
    UploadEvents,
  ],
  exports: [
    EventsGateway,
    EventsGateWayService,
    UserEventsService,
    NotificationEvents,
    UploadEvents,
  ],
})
export class EventsModule {}

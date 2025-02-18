import { Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { EventsGateWayService } from './events.service';
import { UserEventsService } from './user_events/userevents.event';
import { DataBridgeModule } from '@core/maincore/databridge/databridge.module';
import { NotificationEvents } from './notifications/notification.event';
import { UploadEvents } from './upload/upload.event';
import { USER_JWT_EVENTS } from './user_events/jwt.eventsservice';
import { UserAuthService } from './user_events/auth.eventservice';

@Module({
  providers: [
    EventsGateway,
    DataBridgeModule,
    EventsGateWayService,
    UserEventsService,
    NotificationEvents,
    UploadEvents,
    USER_JWT_EVENTS,
    UserAuthService,
  ],
  exports: [
    EventsGateway,
    EventsGateWayService,
    UserEventsService,
    NotificationEvents,
    UploadEvents,
    USER_JWT_EVENTS,
    UserAuthService,
  ],
})
export class EventsModule {}

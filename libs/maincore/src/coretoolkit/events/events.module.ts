import { Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { EventsGateWayService } from './events.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';
import { EnvConfig } from '../config/config';
import { UserEventsService } from './user_events/userevents.event';
import { DataBridgeModule } from '@core/maincore/databridge/databridge.module';
import { NotificationEvents } from './notifications/notification.event';

@Module({
  providers: [
    EventsGateway,
    DataBridgeModule,
    {
      provide: 'EventsGateway',
      useFactory: (
        config: ConfigService<EnvConfig>,
        rabbitmq: RabbitMQService,
      ) => new EventsGateway(config, rabbitmq),
      inject: [ConfigService, RabbitMQService],
    },
    EventsGateWayService,
    UserEventsService,
    NotificationEvents,
  ],
  exports: [
    EventsGateway,
    'EventsGateway',
    EventsGateWayService,
    UserEventsService,
    NotificationEvents,
  ],
})
export class EventsModule {}

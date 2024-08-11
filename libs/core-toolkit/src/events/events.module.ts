import { Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { EventsGateWayService } from './events.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';
import { EnvConfig } from '../config/config';

@Module({
  providers: [
    EventsGateway,
    {
      provide: 'EventsGateway',
      useFactory: (
        config: ConfigService<EnvConfig>,
        rabbitmq: RabbitMQService,
      ) => new EventsGateway(config, rabbitmq),
      inject: [ConfigService, RabbitMQService],
    },
    EventsGateWayService,
  ],
  exports: [
    EventsGateway,
    {
      provide: 'EventsGateway',
      useFactory: (
        config: ConfigService<EnvConfig>,
        rabbitmq: RabbitMQService,
      ) => new EventsGateway(config, rabbitmq),
      inject: [ConfigService, RabbitMQService],
    },
    EventsGateWayService,
  ],
})
export class EventsModule {}

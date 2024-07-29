import { Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { EventsGateWayService } from './events.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/app/config/configuration';
import { RabbitMQService } from 'src/micro/microservices/rabbitmq.service';

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
export class EventsMoule {}

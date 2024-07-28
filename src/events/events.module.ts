import { Global, Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { EventsGateWayService } from './events.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/app/config/configuration';

@Global()
@Module({
  providers: [
    EventsGateway,
    {
      provide: 'EventsGateway',
      useFactory: (config: ConfigService<EnvConfig>) =>
        new EventsGateway(config),
      inject: [ConfigService],
    },
    EventsGateWayService,
  ],
  exports: [
    EventsGateway,
    {
      provide: 'EventsGateway',
      useFactory: (config: ConfigService<EnvConfig>) =>
        new EventsGateway(config),
      inject: [ConfigService],
    },
    EventsGateWayService,
  ],
})
export class EventsMoule {}

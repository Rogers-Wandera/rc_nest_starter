import { Global, Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';

@Global()
@Module({
  providers: [
    EventsGateway,
    { provide: 'EventsGateway', useFactory: () => new EventsGateway() },
  ],
  exports: [
    EventsGateway,
    { provide: 'EventsGateway', useFactory: () => new EventsGateway() },
  ],
})
export class EventsMoule {}

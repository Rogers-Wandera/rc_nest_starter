import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './event.gateway';
import { ConfigModule } from '@nestjs/config';
import { envconfig } from '../config/config';
import { RabbitMQModule } from '../micro/microservices/rabbitmq.module';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
          load: [envconfig],
          cache: true,
        }),
        RabbitMQModule,
      ],
      providers: [EventsGateway],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: async (config: ConfigService<EnvConfig>) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.get<string>('rabbitmqurl')],
              queue: 'notifications_queue',
              queueOptions: {
                durable: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'UPLOAD_SERVICE',
        useFactory: async (config: ConfigService<EnvConfig>) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.get<string>('rabbitmqurl')],
              queue: 'upload_queue',
              queueOptions: {
                durable: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}

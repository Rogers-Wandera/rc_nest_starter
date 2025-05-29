import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EnvConfig, rabbitmq } from '../../config/config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: async (config: ConfigService<EnvConfig>) => {
          const { hostname, password, username, port } =
            config.get<rabbitmq>('rabbitmq');
          const url = `amqp://${username}:${password}@${hostname}:${port}`;
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
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
          const { hostname, password, username, port } =
            config.get<rabbitmq>('rabbitmq');
          const url = `amqp://${username}:${password}@${hostname}:${port}`;
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: 'upload_queue',
              queueOptions: {
                durable: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'EVENTS_SERVICE',
        useFactory: async (config: ConfigService<EnvConfig>) => {
          const { hostname, password, username, port } =
            config.get<rabbitmq>('rabbitmq');
          const url = `amqp://${username}:${password}@${hostname}:${port}`;
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: 'events_queue',
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

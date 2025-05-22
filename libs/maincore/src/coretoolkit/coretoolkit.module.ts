import { Global, Module } from '@nestjs/common';
import { CoreToolkitService } from './coretoolkit.service';
import { DiscoveryModule } from '@nestjs/core';
import { EventsModule } from './events/events.module';
import { RabbitMQModule } from './micro/microservices/rabbitmq.module';
import { CoreAppProviders } from './providers/providers';
import { FileUploadsModule } from './micro/fileuploads/fileuploads.module';
import { MessagingModule } from './messaging/messaging.module';
import { MulterModule } from '@nestjs/platform-express';
import { AsyncLocalStorage } from 'async_hooks';
import { MulterConfigs } from './config/multer.configs';
import { EventLogger } from './app/utils/event.logger';

@Global()
@Module({
  imports: [
    DiscoveryModule,
    MulterModule.register({
      ...MulterConfigs,
    }),
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'short',
    //     ttl: 1000,
    //     limit: 5,
    //   },
    //   {
    //     name: 'medium',
    //     ttl: 10000,
    //     limit: 20,
    //   },
    //   {
    //     name: 'long',
    //     ttl: 60000,
    //     limit: 30,
    //   },
    // ]),
    EventsModule,
    RabbitMQModule,
    FileUploadsModule,
    MessagingModule,
  ],
  providers: [
    CoreToolkitService,
    ...CoreAppProviders,
    EventLogger,
    // {
    //   provide: 'REDIS_CLIENT',
    //   useFactory: () => {
    //     return new Redis({
    //       host: process.env.REDIS_HOST || 'localhost',
    //       port: parseInt(process.env.REDIS_PORT) || 6379,
    //     });
    //   },
    // },
  ],
  exports: [
    CoreToolkitService,
    EventLogger,
    EventsModule,
    RabbitMQModule,
    FileUploadsModule,
    MessagingModule,
    MulterModule,
    AsyncLocalStorage,
    // 'REDIS_CLIENT',
  ],
})
export class CoreToolkitModule {}

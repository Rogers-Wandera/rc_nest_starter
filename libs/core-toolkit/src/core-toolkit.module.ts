import { Global, Module } from '@nestjs/common';
import { CoreToolkitService } from './core-toolkit.service';
import { DiscoveryModule } from '@nestjs/core';
import { EventsModule } from './events/events.module';
import { RabbitMQModule } from './micro/microservices/rabbitmq.module';
import { CoreAppProviders } from './providers/providers';
import { FileUploadsModule } from './micro/fileuploads/fileuploads.module';
import { MessagingModule } from './messaging/messaging.module';
import { MulterModule } from '@nestjs/platform-express';
import { ThrottlerModule } from '@nestjs/throttler';
import { AsyncLocalStorage } from 'async_hooks';
import { MulterConfigs } from './config/multer.configs';

@Global()
@Module({
  imports: [
    DiscoveryModule,
    MulterModule.register({
      ...MulterConfigs,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 30,
      },
    ]),
    EventsModule,
    RabbitMQModule,
    FileUploadsModule,
    MessagingModule,
  ],
  providers: [CoreToolkitService, ...CoreAppProviders],
  exports: [
    CoreToolkitService,
    EventsModule,
    RabbitMQModule,
    FileUploadsModule,
    MessagingModule,
    MulterModule,
    AsyncLocalStorage,
  ],
})
export class CoreToolkitModule {}

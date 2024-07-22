import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envconfig } from './app/config/configuration';
import { EventsMoule } from './events/events.module';
import { UtilsModule } from './app/utils/app.utils.module';
import { AppContextsModule } from './app/context/app.contexts.module';
import { DatabaseModule } from './db/database.module';
import { CoreModules } from './services/core/core.service.module';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  DiscoveryModule,
} from '@nestjs/core';
import { AllExceptionsFilter } from './app/context/exceptions/http-exception.filter';
import { EmailModule } from './app/mailer/mailer.module';
import { TransformPainateQuery } from './app/context/interceptors/jsonparser.interceptor';
import {
  JoiPaginateValidation,
  JoiSchemaValidator,
} from './app/context/interceptors/joi.interceptor';
import { ModelModule } from './model/model.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path, { join } from 'path';
import { DecryptData } from './app/context/interceptors/decrypt.interceptor';
import { ServiceValidator } from './app/context/interceptors/servicevalidator.interceptor';
import { DefaultsModule } from './services/core/defaults/defaults.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FileUploadsModule } from './micro/fileuploads/fileuploads.module';
import { MulterConfigs } from './app/config/multer.configs';
import { MulterModule } from '@nestjs/platform-express';
import { RTechNotifierModule } from '@notify/rtechnotifier';
import { AsyncLocalStorage } from 'async_hooks';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [envconfig],
      cache: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'app', 'templates'),
      serveRoot: '/templates',
    }),
    RTechNotifierModule,
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
    DiscoveryModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, 'app', 'public'),
      exclude: ['/api/(.*)'],
    }),
    EventsMoule,
    UtilsModule,
    AppContextsModule,
    DatabaseModule,
    CoreModules,
    EmailModule,
    ModelModule,
    DefaultsModule,
    FileUploadsModule,
  ],
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DecryptData,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformPainateQuery,
    },
    { provide: APP_INTERCEPTOR, useClass: JoiPaginateValidation },
    { provide: APP_INTERCEPTOR, useClass: ServiceValidator },
    { provide: APP_INTERCEPTOR, useClass: JoiSchemaValidator },
  ],
  exports: [EventsMoule, MulterModule, AsyncLocalStorage],
})
export class AppModule {}

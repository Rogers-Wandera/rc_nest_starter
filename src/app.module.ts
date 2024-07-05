import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envconfig } from './app/config/configuration';
import { EventsMoule } from './events/events.module';
import { UtilsModule } from './app/utils/app.utils.module';
import { AppContextsModule } from './app/context/app.contexts.module';
import { DatabaseModule } from './db/database.module';
import { CoreModules } from './services/core/core.service.module';
import { APP_FILTER, APP_INTERCEPTOR, DiscoveryModule } from '@nestjs/core';
import { AllExceptionsFilter } from './app/context/exceptions/http-exception.filter';
import { EmailModule } from './app/mailer/mailer.module';
import { SystemDefaultRolesModule } from './services/core/defaults/roles/roles.module';
import { TransformPainateQuery } from './app/context/interceptors/jsonparser.interceptor';
import {
  JoiPaginateValidation,
  JoiSchemaValidator,
} from './app/context/interceptors/joi.interceptor';
import { ModelModule } from './model/model.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import { DecryptData } from './app/context/interceptors/decrypt.interceptor';
import { ServiceValidator } from './app/context/interceptors/servicevalidator.interceptor';
import { DefaultsModule } from './services/core/defaults/defaults.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [envconfig],
      cache: true,
    }),
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
  ],
  providers: [
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
  exports: [EventsMoule],
})
export class AppModule {}

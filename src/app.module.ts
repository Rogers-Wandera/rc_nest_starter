import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envconfig } from './app/config/configuration';
import { EventsMoule } from './events/events.module';
import { UtilsModule } from './app/utils/app.utils.module';
import { AppContextsModule } from './app/context/app.contexts.module';
import { DatabaseModule } from './db/database.module';
import { CoreModules } from './services/core/core.service.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './app/context/exceptions/http-exception.filter';
import { EmailModule } from './app/mailer/mailer.module';
import { SystemDefaultRolesModule } from './services/core/defaults/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [envconfig],
      cache: true,
    }),
    EventsMoule,
    UtilsModule,
    AppContextsModule,
    DatabaseModule,
    CoreModules,
    EmailModule,
    SystemDefaultRolesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [EventsMoule],
})
export class AppModule {}

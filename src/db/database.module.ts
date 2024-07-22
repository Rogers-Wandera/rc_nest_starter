import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.provider';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/app/config/configuration';
import { FireBaseService } from './firebase.setup';

@Global()
@Module({
  providers: [
    {
      provide: 'data_source',
      useFactory: async () => {
        const datasource = new DatabaseService();
        await datasource.initialize();
        return datasource;
      },
    },
    {
      provide: 'FIREBASE_SERVICE',
      useFactory: async (config: ConfigService<EnvConfig>) => {
        const firebase = new FireBaseService(
          config.get('firebase_web'),
          config.get('firebaseServiceAccount'),
        );
        return firebase;
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    {
      provide: 'data_source',
      useFactory: async () => {
        const datasource = new DatabaseService();
        await datasource.initialize();
        return datasource;
      },
    },
    {
      provide: 'FIREBASE_SERVICE',
      useFactory: async (config: ConfigService<EnvConfig>) => {
        const firebase = new FireBaseService(
          config.get('firebase_web'),
          config.get('firebaseServiceAccount'),
        );
        return firebase;
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}

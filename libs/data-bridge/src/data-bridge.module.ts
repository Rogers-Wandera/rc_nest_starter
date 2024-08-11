import { Global, Module } from '@nestjs/common';
import { DataBridgeService } from './data-bridge.service';
import { ConfigService } from '@nestjs/config';
import { FireBaseService } from './databuilder/firebase.setup';
import { EntityDataSource } from './model/enity.data.model';
import { EnvConfig } from '@toolkit/core-toolkit/config/config';

@Global()
@Module({
  providers: [
    {
      provide: 'data_source',
      useFactory: async () => {
        const datasource = new DataBridgeService();
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
    DataBridgeService,
    EntityDataSource,
  ],
  exports: [
    DataBridgeService,
    'data_source',
    'FIREBASE_SERVICE',
    EntityDataSource,
  ],
})
export class DataBridgeModule {}

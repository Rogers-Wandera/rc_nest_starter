import { Global, Module } from '@nestjs/common';
import { DataBridgeService } from './databridge.service';
import { ConfigService } from '@nestjs/config';
import { FireBaseService } from './databuilder/firebase.setup';
import { EntityDataSource } from './model/enity.data.model';
import { EnvConfig } from '../coretoolkit/config/config';
import { FirebaseOptions } from 'firebase/app';
import { ServiceAccount } from 'firebase-admin';

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
          config.get('firebase_web') as FirebaseOptions,
          config.get('firebaseServiceAccount') as ServiceAccount,
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

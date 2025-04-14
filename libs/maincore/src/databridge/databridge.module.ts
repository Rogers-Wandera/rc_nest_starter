import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import { DataBridgeService } from './databridge.service';
import { EntityDataSource } from './model/enity.data.model';

interface RDatabaseAsyncConfig {
  imports?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<DataSourceOptions> | DataSourceOptions;
  inject?: any[];
}
@Global()
@Module({})
export class DataBridgeModule {
  static register(config: DataSourceOptions): DynamicModule {
    return {
      module: DataBridgeModule,
      providers: [
        { provide: 'RDATABASE_CONFIG', useValue: config },
        {
          provide: 'data_source',
          useFactory: async (config: DataSourceOptions) => {
            const db = new DataBridgeService(config);
            await db.initialize();
            return db;
          },
          inject: ['RDATABASE_CONFIG'],
        },
        DataBridgeService,
        EntityDataSource,
      ],
      exports: ['data_source', DataBridgeService, EntityDataSource],
    };
  }
  static registerAsync(options: RDatabaseAsyncConfig): DynamicModule {
    const provider: Provider = {
      provide: 'RDATABASE_CONFIG',
      useFactory: async (...args: any[]) => {
        const configs = await options.useFactory(...args);
        return configs;
      },
      inject: options.inject || [],
    };
    return {
      module: DataBridgeModule,
      imports: options.imports || [],
      providers: [
        provider,
        {
          provide: 'data_source',
          useFactory: async (config: DataSourceOptions) => {
            const db = new DataBridgeService(config);
            await db.initialize();
            return db;
          },
          inject: ['RDATABASE_CONFIG'],
        },
        DataBridgeService,
        EntityDataSource,
      ],
      exports: ['data_source', DataBridgeService, EntityDataSource],
    };
  }
}

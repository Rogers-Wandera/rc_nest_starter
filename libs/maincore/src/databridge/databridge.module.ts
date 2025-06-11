import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EntityDataSource } from './model/enity.data.model';
import {
  TypeOrmModule,
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ModelService } from './model/model.service';

interface RDatabaseAsyncConfig {
  imports?: any[];
  useFactory: (
    ...args: any[]
  ) => TypeOrmModuleOptions | Promise<TypeOrmModuleOptions>;
  inject?: any[];
}
@Global()
@Module({})
export class DataBridgeModule {
  static register(config: TypeOrmModuleOptions): DynamicModule {
    return {
      module: DataBridgeModule,
      imports: [TypeOrmModule.forRoot(config)],
      providers: [
        { provide: 'RDATABASE_CONFIG', useValue: config },
        {
          provide: ModelService,
          useFactory: (source: DataSource) => {
            return new ModelService(source);
          },
          inject: [DataSource],
        },
        EntityDataSource,
      ],
      exports: [TypeOrmModule, ModelService, EntityDataSource],
    };
  }
  static registerAsync(options: RDatabaseAsyncConfig): DynamicModule {
    const configProvider: Provider = {
      provide: 'RDATABASE_CONFIG',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
    const typeOrmAsyncOptions: TypeOrmModuleAsyncOptions = {
      imports: options.imports || [],
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
    return {
      module: DataBridgeModule,
      imports: [TypeOrmModule.forRootAsync(typeOrmAsyncOptions)],
      providers: [
        configProvider,
        {
          provide: ModelService,
          useFactory: (source: DataSource) => {
            return new ModelService(source);
          },
          inject: [DataSource],
        },
        EntityDataSource,
      ],
      exports: [TypeOrmModule, ModelService, EntityDataSource],
    };
  }
}

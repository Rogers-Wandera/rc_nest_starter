import { entities, MaincoreModule, views, subscribers } from '@core/maincore';
import { RedisIoAdapter } from '@core/maincore/coretoolkit/adapters/redis.adapter';
import {
  dbconfig,
  EnvConfig,
  envconfig,
} from '@core/maincore/coretoolkit/config/config';
import { DataBridgeModule } from '@core/maincore/databridge/databridge.module';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

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
      rootPath: path.join(__dirname, 'app', 'public'),
      exclude: ['/api/(.*)'],
    }),
    MaincoreModule,
    DataBridgeModule.registerAsync({
      useFactory: async (config: ConfigService<EnvConfig>) => {
        const options = config.get<dbconfig>('database');
        return {
          type: 'mysql',
          host: options.host,
          port: options.port,
          username: options.username,
          password: options.password,
          database: options.name,
          entities: [...entities, ...views],
          subscribers: [...subscribers],
          migrations: [],
          synchronize: true,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisIoAdapter],
  exports: [RedisIoAdapter],
})
export class DefaultAppModule {}

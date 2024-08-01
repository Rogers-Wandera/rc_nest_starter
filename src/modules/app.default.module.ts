import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envconfig } from '../app/config/configuration';
import { ServeStaticModule } from '@nestjs/serve-static';
import path, { join } from 'path';
import { DataBridgeModule } from '@bridge/data-bridge';
import { CoreServicesModule } from '@services/core-services';
import { CoreToolkitModule } from '@toolkit/core-toolkit';
import { CoreControllerModule } from '@controller/core-controller';

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
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, 'app', 'public'),
      exclude: ['/api/(.*)'],
    }),
    DataBridgeModule,
    CoreToolkitModule,
    CoreServicesModule,
    CoreControllerModule,
  ],
})
export class DefaultAppModule {}

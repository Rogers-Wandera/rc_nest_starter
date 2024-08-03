import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import { DataBridgeModule } from '@bridge/data-bridge';
import { CoreServicesModule } from '@services/core-services';
import { CoreToolkitModule } from '@toolkit/core-toolkit';
import { CoreControllerModule } from '@controller/core-controller';
import { envconfig } from '@toolkit/core-toolkit/config/config';
import { AuthGuardsModule } from '@auth/auth-guards';

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
    DataBridgeModule,
    CoreToolkitModule,
    CoreServicesModule,
    CoreControllerModule,
    AuthGuardsModule,
  ],
})
export class DefaultAppModule {}

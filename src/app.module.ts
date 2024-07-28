import { Global, Module } from '@nestjs/common';
import { DefaultAppModule } from './modules/app.default.module';

@Global()
@Module({
  imports: [DefaultAppModule],
  exports: [DefaultAppModule],
})
export class AppModule {}

import { Global, Module } from '@nestjs/common';
import { Utilities } from './app.utils';
import { EventsMoule } from 'src/events/events.module';

@Global()
@Module({
  imports: [EventsMoule],
  providers: [Utilities],
  exports: [Utilities],
})
export class UtilsModule {}

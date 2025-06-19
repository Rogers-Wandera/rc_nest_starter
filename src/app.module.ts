import {
  Global,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DefaultAppModule } from './modules/app.default.module';
import { RedisConnection } from '@core/maincore/coretoolkit/adapters/redis.adapter';
import { UserPresenceService } from '@core/maincore/coretoolkit/services/online.user.service';
import { UserSessionService } from '@core/maincore/coretoolkit/services/session.user.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [
    DefaultAppModule,
    HttpModule.register({
      global: true,
    }),
  ],
  exports: [DefaultAppModule],
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppModule.name);
  constructor(
    private redisAdapter: RedisConnection,
    private userPresence: UserPresenceService,
    private userSession: UserSessionService,
  ) {}
  async onModuleInit() {
    await this.redisAdapter.connectToRedis();
    await this.userPresence.initialize();
    await this.userSession.initialize();
  }

  onModuleDestroy() {
    this.logger.debug('The app Module has been destroyed');
  }
}

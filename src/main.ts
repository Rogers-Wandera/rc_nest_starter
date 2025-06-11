import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { credentials } from './app/config/credentials';
import { corsOptions } from './app/config/corsoptions';
import { EnvConfig } from '@core/maincore/coretoolkit/config/config';
import {
  LoggingMiddleware,
  ServerLogger,
} from '@core/maincore/coretoolkit/middlewares/logger.middleware';
import { setupSwagger } from '@core/maincore/corecontroller/swagger/swagger';
import { AuthenticatedSocketAdapter } from '@core/maincore/coretoolkit/contexts/guards/socket.guard';
import { ApplicationContext } from '@core/maincore/coretoolkit/contexts/app.context';
import { ValidationPipe } from '@nestjs/common';
import { TimeoutInterceptor } from '@core/maincore/coretoolkit/contexts/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });
  app.use(credentials);
  app.enableCors(corsOptions);
  app.setGlobalPrefix(app.get(ConfigService<EnvConfig>).get('baseapi'));
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TimeoutInterceptor(reflector));
  app.use(new LoggingMiddleware().use);
  app.use(new ServerLogger().use);
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      skipUndefinedProperties: true,
      stopAtFirstError: true,
    }),
  );
  app.useWebSocketAdapter(
    new AuthenticatedSocketAdapter(app, app.get(ConfigService<EnvConfig>)),
  );
  setupSwagger(app);
  const appContext = app.get(ApplicationContext);
  appContext.app = app;

  await app.listen(app.get(ConfigService<EnvConfig>).get('port'), async () => {
    console.log('App running on ' + (await app.getUrl()));
  });
  app.enableShutdownHooks();
}
bootstrap();

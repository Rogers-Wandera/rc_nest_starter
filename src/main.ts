import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { credentials } from './app/config/credentials';
import { corsOptions } from './app/config/corsoptions';
import {
  LoggingMiddleware,
  ServerLogger,
} from '@toolkit/core-toolkit/middlewares/logger.middleware';
import { setupSwagger } from '@controller/core-controller/swagger/swagger';
import { EnvConfig } from '@toolkit/core-toolkit/config/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });
  app.use(credentials);
  app.enableCors(corsOptions);
  app.setGlobalPrefix(app.get(ConfigService<EnvConfig>).get('baseapi'));
  app.use(new LoggingMiddleware().use);
  app.use(new ServerLogger().use);
  setupSwagger(app);
  await app.listen(app.get(ConfigService<EnvConfig>).get('port'), async () => {
    console.log('App running on ' + (await app.getUrl()));
  });
  app.enableShutdownHooks();
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './app/config/configuration';
import {
  LoggingMiddleware,
  ServerLogger,
} from './middlewares/logger.middleware';
import { credentials } from './app/config/credentials';
import { corsOptions } from './app/config/corsoptions';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupSwagger } from './swagger/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });
  app.use(credentials);
  app.enableCors(corsOptions);
  app.setGlobalPrefix(app.get(ConfigService<EnvConfig>).get('baseapi'));
  app.use(new LoggingMiddleware().use);
  app.use(new ServerLogger().use);

  // const config = new DocumentBuilder()
  //   .setTitle('RC TECH DOCUMENTATION')
  //   .setDescription(
  //     'This documentation gives u a clear over view of how to use the server',
  //   )
  //   .setVersion('1.0')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  // // Document middleware (optional)
  // document.components = {
  //   ...document.components,
  //   schemas: {
  //     LoggingMiddleware: {
  //       type: 'object',
  //       properties: {
  //         // Example properties for LoggingMiddleware if needed
  //       },
  //     },
  //     ServerLogger: {
  //       type: 'object',
  //       properties: {
  //         // Example properties for ServerLogger if needed
  //       },
  //     },
  //   },
  // };
  setupSwagger(app);
  await app.listen(app.get(ConfigService<EnvConfig>).get('port'), async () => {
    console.log('App running on ' + (await app.getUrl()));
  });
}
bootstrap();

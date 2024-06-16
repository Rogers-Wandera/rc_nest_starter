import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig, mailconfig } from '../config/configuration';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { EmailService } from './mailer.service';
import path from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService<EnvConfig>) => ({
        transport: {
          host: config.get<mailconfig>('mail').host,
          secure: true,
          auth: config.get<mailconfig>('mail').auth,
          port: config.get<mailconfig>('mail').port,
        },
        defaults: {
          from: 'RC-CHAT',
        },
        template: {
          dir: path.join(__dirname, '..', 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

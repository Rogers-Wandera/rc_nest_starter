import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { RTECHEmailService } from './mailer.service';
import { EnvConfig, mailconfig } from '../configs/config';

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
          from: 'R-TECH',
        },
        template: {
          dir: 'src/app/templates',
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RTECHEmailService],
  exports: [RTECHEmailService],
})
export class RTECHEmailModule {}

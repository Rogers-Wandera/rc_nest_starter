import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config/configuration';
import { mailer2Options } from './mailer.types';
import { RTechNotifier } from '@notify/rtechnotifier';

@Injectable()
export class EmailService {
  private company: string;
  constructor(
    private readonly mailService: RTechNotifier,
    configservice: ConfigService<EnvConfig>,
  ) {
    this.company = configservice.get('comapny');
  }

  async SendWithMailer2(content: mailer2Options) {
    const company = content.company || this.company;
    this.mailService.company = company;
    this.mailService.mailoptions = {
      to: content.email,
      subject: content.subject,
      template: `mailer2`,
      context: content,
    };
    const response = await this.mailService.notification('email');
    return response;
  }
}

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entity/core/users.entity';
import { EnvConfig } from '../config/configuration';
import { mailer2Options } from './mailer.types';

@Injectable()
export class EmailService {
  private company: string;
  constructor(
    private readonly mailService: MailerService,
    configservice: ConfigService<EnvConfig>,
  ) {
    this.company = configservice.get('comapny');
  }
  async sendVerificationEmail(
    user: User,
    link: string,
    additionalhtml: string | string[] = '',
  ) {
    const emailData = {
      recipientName: user.firstname + ' ' + user.lastname,
      serverData: 'Please confirm registration',
      senderName: 'RC-TECH',
      link: link,
      moredata: [...additionalhtml],
    };
    return await this.mailService.sendMail({
      to: user.email,
      subject: 'Welcome to RC-TECH please confirm your email',
      template: './verify',
      context: emailData,
    });
  }

  async SendMail(
    email: string,
    subject: string,
    template: string,
    context: { [name: string]: unknown },
  ) {
    return await this.mailService.sendMail({
      to: email,
      subject: subject,
      template: `./${template}`,
      context: context,
    });
  }

  async SendWithMailer2(content: mailer2Options) {
    const company = content.company || this.company;
    content.company = company;
    const response = await this.SendMail(
      content.email,
      content.subject,
      'mailer2',
      content,
    );
    return response;
  }
}

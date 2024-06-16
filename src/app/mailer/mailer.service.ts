import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/core/users.entity';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}
  async sendVerificationEmail(
    user: User,
    link: string,
    additionalhtml: string | string[] = '',
  ) {
    // console.log(this.mailService.verifyAllTransporters())
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
}

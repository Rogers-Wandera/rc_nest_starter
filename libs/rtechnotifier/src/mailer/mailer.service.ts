import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RTECHEmailService {
  public company: string;
  constructor(private readonly mailService: MailerService) {
    this.company = '';
  }

  async SendEmail(options: ISendMailOptions) {
    await this.mailService.verifyAllTransporters();
    return this.mailService.sendMail({
      ...options,
      from: this.company,
    });
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config/configuration';
import { RabbitMQService } from 'src/micro/microservices/rabbitmq.service';
import { NotifyTypes, SmsPayload } from '../types/notification/notify.types';
import { EmailTemplates } from '../types/enums/emailtemplates.enum';
import { NOTIFICATION_PATTERN } from '../patterns/notification.patterns';
import { mailer2Content } from '../types/notification/mailer.types';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { Address } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { NotifyResponse } from '../types/enums/notifyresponse.enum';
import { PRIORITY_TYPES } from '../app.types';

@Injectable()
export class MessagingService {
  private company: string;
  constructor(
    configservice: ConfigService<EnvConfig>,
    private readonly client: RabbitMQService,
  ) {
    this.company = configservice.get('company');
  }

  SendWithMailer2(content: {
    email: { to: string | Address; priority: PRIORITY_TYPES }[];
    subject: string;
    context: mailer2Content['context'];
    company?: string;
  }): Promise<NotifyResponse.EMAIL> {
    const company = content.company || this.company;
    const options: NotifyTypes = {
      type: 'email',
      payload: {
        to: content.email,
        subject: content.subject,
        template: EmailTemplates.MAILER_2,
        context: content.context,
        company,
      },
    };
    return lastValueFrom(
      this.client.send(NOTIFICATION_PATTERN.NOTIFY, options),
    );
  }

  SendSms(
    payload: SmsPayload,
  ): Promise<NotifyResponse.SMS_SUCCESS | NotifyResponse.SMS_FAILURE> {
    const smsoptions: NotifyTypes = {
      type: 'sms',
      payload: payload,
    };
    return lastValueFrom(
      this.client.send(NOTIFICATION_PATTERN.NOTIFY, smsoptions).pipe(
        catchError((err: Record<string, any>) => {
          return throwError(() => new BadRequestException(err));
        }),
      ),
    );
  }
}

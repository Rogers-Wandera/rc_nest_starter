import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotifyTypes, SmsPayload } from '../types/notification/notify.types';
import { mailer2Content } from '../types/notification/mailer.types';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { Address } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';
import { EnvConfig } from '../config/config';
import {
  EmailTemplates,
  NOTIFICATION_PATTERN,
  NotifyResponse,
  PRIORITY_TYPES,
} from '../types/enums/enums';

/**
 * Service for sending notifications via email and SMS.
 * Integrates with RabbitMQ for message handling and uses configuration values for notification settings.
 *
 * @class MessagingService
 */
@Injectable()
export class MessagingService {
  private company: string;

  /**
   * Creates an instance of `MessagingService`.
   *
   * @param {ConfigService<EnvConfig>} configservice Service for accessing configuration values.
   * @param {RabbitMQService} client Service for sending messages to RabbitMQ.
   */
  constructor(
    configservice: ConfigService<EnvConfig>,
    private readonly client: RabbitMQService,
  ) {
    this.company = configservice.get('company');
  }

  /**
   * Sends an email using the Mailer2 template via RabbitMQ.
   *
   * @param {Object} content The content of the email to be sent.
   * @param {Array<{ to: string | Address; priority: PRIORITY_TYPES }>} content.email Array of email recipients and their priority.
   * @param {string} content.subject The subject of the email.
   * @param {mailer2Content['context']} content.context The context for the email template.
   * @param {string} [content.company] Optional company name to override the default.
   * @returns {Promise<NotifyResponse.EMAIL>} Promise resolving to the response of the email notification.
   */
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

  /**
   * Sends an SMS via RabbitMQ.
   *
   * @param {SmsPayload} payload The payload containing SMS details.
   * @returns {Promise<NotifyResponse.SMS_SUCCESS | NotifyResponse.SMS_FAILURE>} Promise resolving to the result of the SMS notification.
   * @throws {BadRequestException} Throws an exception if the SMS sending fails.
   */
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

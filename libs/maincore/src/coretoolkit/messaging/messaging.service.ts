import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';
import { EnvConfig } from '../config/config';
import {
  EmailNotificationType,
  NotificationEvent,
  SmsNotificationType,
} from '../interfaces/notification.interface';
import { NOTIFICATION_PATTERN, NotifyResponse } from '../types/enums/enums';

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
   * Sends an email notification via RabbitMQ.
   *
   * @returns {NotifyResponse.EMAIL} Promise resolving to the response of the email notification.
   */
  SendEmailNoAck(content: EmailNotificationType): NotifyResponse.EMAIL {
    this.client.emit(NOTIFICATION_PATTERN.NOTIFY, content);
    return NotifyResponse.EMAIL;
  }

  /**
   * Sends an email notification via RabbitMQ and waits for a response.
   */
  sendEmailWithAck(content: EmailNotificationType): Promise<NotificationEvent> {
    return lastValueFrom(
      this.client.send(NOTIFICATION_PATTERN.NOTIFY, content).pipe(
        catchError((err: Record<string, any>) => {
          return throwError(() => new BadRequestException(err));
        }),
      ),
    );
  }

  /**
   * Sends an SMS via RabbitMQ.
   * @throws {BadRequestException} Throws an exception if the SMS sending fails.
   */
  SendSms(payload: SmsNotificationType): Promise<NotificationEvent> {
    return lastValueFrom(
      this.client.send(NOTIFICATION_PATTERN.NOTIFY, payload).pipe(
        catchError((err: Record<string, any>) => {
          return throwError(() => new BadRequestException(err));
        }),
      ),
    );
  }
}

import { Inject, Injectable, Logger, UseInterceptors } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { RTechSystemNotificationType } from '../types/notification/notify.types';
import { Server } from 'socket.io';
import { NOTIFICATION_PATTERN } from '../types/enums/enums';
import { corsOptions } from '../config/corsoptions';
import { EventsGateway } from './event.gateway';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';
import { RecipientsValidator } from '../contexts/interceptors/recipients.interceptor';
import { lastValueFrom } from 'rxjs';
import { PRIORITY_TYPES } from '../types/enums/enums';

/**
 * WebSocket gateway service for handling system notifications and login events.
 * Configured to work with Socket.IO and integrates with RabbitMQ for message handling.
 *
 * @class EventsGateWayService
 */
@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class EventsGateWayService {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger();

  /**
   * Creates an instance of `EventsGateWayService`.
   *
   * @param {EventsGateway} events - Service for emitting events to clients.
   * @param {RabbitMQService} rmqService - Service for interacting with RabbitMQ.
   */
  constructor(
    @Inject('EventsGateway') private readonly events: EventsGateway,
    private readonly rmqService: RabbitMQService,
  ) {}

  /**
   * Handles incoming system notifications by broadcasting to specific recipients.
   *
   * @param {RTechSystemNotificationType} data - The notification data to be processed.
   * @returns {Promise<WsResponse | undefined>} - A promise that resolves to the WebSocket response or undefined.
   */
  @SubscribeMessage(NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION)
  @UseInterceptors(RecipientsValidator)
  async HandleSystemNotification(
    @MessageBody() data: RTechSystemNotificationType,
  ): Promise<WsResponse | undefined> {
    const recipients = data.recipient;
    const failed: { to: string; priority?: PRIORITY_TYPES }[] = [];

    if (recipients.type === 'no broadcast') {
      for (const recipient in recipients.recipients) {
        const response = await this.events.emitToClient(
          recipients.recipients[recipient].to,
          data,
        );
        if (response === false) {
          failed.push(recipients.recipients[recipient]);
        } else {
          this.logger.log(
            `Notification sent to user ${recipients.recipients[recipient].to}`,
          );
        }
      }
      this.HandleFailed(failed, data);
      return undefined;
    }

    const pattern = data.pattern;
    return { event: pattern, data };
  }

  /**
   * Handles login events by processing the received data.
   *
   * @param {any} data - The login event data.
   */
  @SubscribeMessage(NOTIFICATION_PATTERN.LOGIN)
  handleLogin(@MessageBody() data: any) {
    return data;
  }

  /**
   * Handles failed notifications by scheduling them for automatic resending.
   *
   * @param {Array<{ to: string; priority?: PRIORITY_TYPES }>} recipients - List of recipients that failed to receive the notification.
   * @param {RTechSystemNotificationType} data - The notification data to be resent.
   */
  private async HandleFailed(
    recipients: { to: string; priority?: PRIORITY_TYPES }[],
    data: RTechSystemNotificationType,
  ) {
    if (recipients.length <= 0) {
      return;
    }
    const resenddata = {
      ...data,
      recipient: { type: 'no broadcast', recipients: recipients },
    };
    await lastValueFrom(
      this.rmqService.emit(NOTIFICATION_PATTERN.RESEND, resenddata),
    );
    this.logger.log(`Resend automatically scheduled`);
  }
}

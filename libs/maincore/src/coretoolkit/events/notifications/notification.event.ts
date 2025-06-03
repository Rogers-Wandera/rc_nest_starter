import { Injectable, Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { corsOptions } from '../../config/corsoptions';
import { EventsGateway } from '../event.gateway';
import { NOTIFICATION_PATTERN, RabbitMQQueues } from '../../types/enums/enums';
import { RabbitMQService } from '../../micro/microservices/rabbitmq.service';
import { EventLogger } from '../../app/utils/event.logger';

@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class NotificationEvents {
  private logger: Logger = new Logger(NotificationEvents.name);

  /**
   * Creates an instance of `EventsGateWayService`.
   *
   * @param {EventsGateway} events - Service for emitting events to clients.
   */
  constructor(
    private readonly events: EventsGateway,
    private readonly rmqService: RabbitMQService,
    private readonly eventslogger: EventLogger,
  ) {
    this.rmqService.setQueue(RabbitMQQueues.NOTIFICATIONS);
  }

  /**
   * Handles incoming system notifications by broadcasting to specific recipients.
   *
   * @param {RTechSystemNotificationType} data - The notification data to be processed.
   * @returns {Promise<WsResponse | undefined>} - A promise that resolves to the WebSocket response or undefined.
   */
  // @SubscribeMessage(NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION)
  // @UseInterceptors(RecipientsValidator)
  // async HandleSystemNotification(
  //   @MessageBody() data: RTechSystemNotificationType,
  // ): Promise<WsResponse | undefined> {
  //   const recipients = data.recipient;
  //   const failed: { to: string; priority?: PRIORITY_TYPES }[] = [];

  //   if (recipients.type === 'no broadcast') {
  //     for (const recipient in recipients.recipients) {
  //       const response = this.emitToClient(
  //         recipients.recipients[recipient].to,
  //         data,
  //       );
  //       if (response === false) {
  //         failed.push(recipients.recipients[recipient]);
  //       } else {
  //         // this.rmqService.emit(NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION);
  //         this.logger.log(
  //           `Notification sent to user ${recipients.recipients[recipient].to}`,
  //         );
  //       }
  //     }
  //     this.HandleFailed(failed, data);
  //     return undefined;
  //   }

  //   const pattern = data.pattern;
  //   return { event: pattern, data };
  // }

  // /**
  //  * Handles failed notifications by scheduling them for automatic resending.
  //  *
  //  * @param {Array<{ to: string; priority?: PRIORITY_TYPES }>} recipients - List of recipients that failed to receive the notification.
  //  * @param {RTechSystemNotificationType} data - The notification data to be resent.
  //  */
  // private HandleFailed(
  //   recipients: { to: string; priority?: PRIORITY_TYPES }[],
  //   data: RTechSystemNotificationType,
  // ) {
  //   if (recipients.length <= 0) {
  //     return;
  //   }
  //   const resenddata = {
  //     ...data,
  //     recipient: { type: 'no broadcast', recipients: recipients },
  //   };
  //   this.rmqService.emit(NOTIFICATION_PATTERN.RESEND, resenddata);
  //   this.logger.log(`Resend automatically scheduled`);
  // }
  /**
   * Emits a notification to a specific client and schedules a re-send if the client is not connected.
   *
   * @param {string} userId - The ID of the user to notify.
   * @param {RTechSystemNotificationType} data - The notification data to be sent.
   */
  // emitToClient(userId: string, data: RTechSystemNotificationType) {
  //   const client = this.events.getClients().get(userId);
  //   if (client) {
  //     client.emit(data.pattern, data);
  //     if (data.resendId) {
  //       this.rmqService.emit(NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION, data);
  //     } else {
  //       this.rmqService.emit(
  //         NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION_SENT,
  //         data,
  //       );
  //       this.rmqService.emit(NOTIFICATION_PATTERN.USER_NOTIFICATIONS, {
  //         userId: userId,
  //       });
  //     }
  //     return true;
  //   } else {
  //     this.logger.warn(`User id: ${userId} not logged in at the moment`);
  //     this.logger.log(
  //       `Automatic re-scheduling enabled for this user ${userId}`,
  //     );
  //     return false;
  //   }
  // }

  @SubscribeMessage(NOTIFICATION_PATTERN.USER_NOTIFICATIONS)
  async HandleUserNotification(
    @MessageBody() data: { userId: string; data: Record<string, any> },
  ) {
    // const client = this.events.getClients().get(data.userId);
    // if (client) {
    //   client.emit(NOTIFICATION_PATTERN.USER_NOTIFICATIONS, data.data);
    // }
  }

  // @SubscribeMessage(NOTIFICATION_PATTERN.UPDATE_READ)
  // HandleUpdateRead(@MessageBody() data: { id: string; userId: string }) {
  //   if (data?.id && data?.userId) {
  //     this.rmqService.emit(NOTIFICATION_PATTERN.UPDATE_READ, data);
  //     this.eventslogger.logEvent(`User Read a notification`, 'user_events', {
  //       userId: data.userId,
  //       eventType: 'UPDATE_READ',
  //     });
  //   }
  // }

  @SubscribeMessage('notification')
  HandleNotification(@MessageBody() data: any) {
    console.log('recieved', data);
    return { status: 'received' };
  }

  @SubscribeMessage('annoucement')
  HandleAnnoucement(@MessageBody() data: any) {
    console.log('recieved', data);
    return { status: 'received' };
  }

  @SubscribeMessage('system')
  HandleMessage(@MessageBody() data: any) {
    console.log('recieved', data);
    return { status: 'received' };
  }
}

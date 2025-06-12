import { Injectable, Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { corsOptions } from '../../config/corsoptions';
import { EventsGateway } from '../event.gateway';
import { NOTIFICATION_PATTERN, RabbitMQQueues } from '../../types/enums/enums';
import { RabbitMQService } from '../../micro/microservices/rabbitmq.service';
import { EventLogger } from '../../app/utils/event.logger';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class NotificationEvents {
  private logger: Logger = new Logger(NotificationEvents.name);

  @WebSocketServer()
  server: Server;

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

  @SubscribeMessage(NOTIFICATION_PATTERN.GET_NOTIFICATIONS)
  HandleGetNotifications(@MessageBody() data: { userId: string }) {
    this.server.emit(NOTIFICATION_PATTERN.USER_NOTIFICATIONS, data);
  }
}

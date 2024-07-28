import { Inject, Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { RTechSystemNotificationType } from 'src/app/types/notification/notify.types';
import { Server } from 'socket.io';
import { NOTIFICATION_PATTERN } from 'src/app/patterns/notification.patterns';
import { corsOptions } from 'src/app/config/corsoptions';
import { EventsGateway } from './event.gateway';
import { RabbitMQService } from 'src/micro/microservices/rabbitmq.service';

@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class EventsGateWayService {
  @WebSocketServer()
  server: Server;
  constructor(
    @Inject('EventsGateway') private readonly events: EventsGateway,
    private readonly rmqService: RabbitMQService,
  ) {
    events.rmqService = this.rmqService;
  }
  @SubscribeMessage(NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION)
  async HandleSystemNotification(
    @MessageBody() data: RTechSystemNotificationType,
  ): Promise<WsResponse | undefined> {
    const recipients = data.recipient;
    if (recipients.type === 'no broadcast') {
      for (const recipient in recipients.recipients) {
        await this.events.emitToClient(recipients.recipients[recipient], data);
        return undefined;
      }
    }
    const pattern = data.pattern;
    return { event: pattern, data };
  }
  @SubscribeMessage(NOTIFICATION_PATTERN.LOGIN)
  handleLogin(@MessageBody() data: any) {
    console.log(data);
    return data;
  }
}

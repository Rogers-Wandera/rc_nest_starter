import { Inject, Injectable, Logger, UseInterceptors } from '@nestjs/common';
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
import { RecipientsValidator } from 'src/app/context/interceptors/recipients.interceptor';
import { lastValueFrom } from 'rxjs';

@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class EventsGateWayService {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger();
  constructor(
    @Inject('EventsGateway') private readonly events: EventsGateway,
    private readonly rmqService: RabbitMQService,
  ) {}
  @SubscribeMessage(NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION)
  @UseInterceptors(RecipientsValidator)
  async HandleSystemNotification(
    @MessageBody() data: RTechSystemNotificationType,
  ): Promise<WsResponse | undefined> {
    const recipients = data.recipient;
    const failed: string[] = [];
    if (recipients.type === 'no broadcast') {
      for (const recipient in recipients.recipients) {
        const response = await this.events.emitToClient(
          recipients.recipients[recipient],
          data,
        );
        if (response === false) {
          failed.push(recipients.recipients[recipient]);
        }
      }
      this.HandleFailed(failed, data);
      return undefined;
    }
    const pattern = data.pattern;
    return { event: pattern, data };
  }
  @SubscribeMessage(NOTIFICATION_PATTERN.LOGIN)
  handleLogin(@MessageBody() data: any) {
    console.log(data);
    return data;
  }

  private async HandleFailed(
    recipients: string[],
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

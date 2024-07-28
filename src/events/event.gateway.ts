import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/app/config/configuration';
import { corsOptions } from 'src/app/config/corsoptions';
import { NOTIFICATION_PATTERN } from 'src/app/patterns/notification.patterns';
import { RTechSystemNotificationType } from 'src/app/types/notification/notify.types';
import { RabbitMQService } from 'src/micro/microservices/rabbitmq.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  private logger = new Logger(EventsGateway.name);
  private clients: Map<string, Socket> = new Map();
  public rmqService: RabbitMQService;
  constructor(private readonly config: ConfigService<EnvConfig>) {}

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket) {
    const { sockets } = this.server.sockets;
    const token = client.handshake.auth.token as string;
    this.HandleAuthorizationClient(token, client);
    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: Socket) {
    this.clients.forEach((value, key) => {
      if (value.id === client.id) {
        this.clients.delete(key);
      }
    });
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  private HandleAuthorizationClient(token: string, client: Socket) {
    const accesstoken = this.config.get<string>('sockettoken');
    if (!token || token !== accesstoken) {
      client.emit('AuthError', {
        message: 'Authentication errors: Token required or invalid',
      });
      client.disconnect(true);
      return;
    }
  }

  async emitToClient(userId: string, data: RTechSystemNotificationType) {
    const client = this.clients.get(userId);
    console.log(client);
    if (client) {
      client.emit(data.pattern, data);
      return true;
    } else {
      this.logger.warn(`User id: ${userId} not loggedIn at the moment`);
      this.logger.log(
        `Automatic Re-scheduling enabled for this user ${userId}`,
      );
      if (this.rmqService) {
        const resenddata: RTechSystemNotificationType = {
          ...data,
          recipient: { type: 'no broadcast', recipients: [userId] },
        };
        await lastValueFrom(
          this.rmqService.emit(NOTIFICATION_PATTERN.RESEND, resenddata),
        );
        this.logger.log(`Resend automatically scheduled`);
      } else {
        this.logger.warn(`Resend notification failded`);
      }
    }
  }

  @SubscribeMessage(NOTIFICATION_PATTERN.LOGIN)
  HandleLogin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.clients.set(data.userId, client);
    this.logger.log(
      `User id: ${data.userId} connected with client id: ${client.id}`,
    );
  }
}

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
import { corsOptions } from '../config/corsoptions';
import { NOTIFICATION_PATTERN } from '../types/enums/enums';
import { RTechSystemNotificationType } from '../types/notification/notify.types';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';
import { lastValueFrom } from 'rxjs';
import { EnvConfig } from '../config/config';

/**
 * WebSocket gateway for managing client connections and handling system notifications.
 * Implements lifecycle hooks for WebSocket events and integrates with RabbitMQ for message handling.
 *
 * @class EventsGateway
 * @implements {OnGatewayConnection}
 * @implements {OnGatewayDisconnect}
 * @implements {OnGatewayInit}
 */
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

  /**
   * Creates an instance of `EventsGateway`.
   *
   * @param {ConfigService<EnvConfig>} config - Service for accessing configuration values.
   * @param {RabbitMQService} rmqService - Service for interacting with RabbitMQ.
   */
  constructor(
    private readonly config: ConfigService<EnvConfig>,
    private readonly rmqService: RabbitMQService,
  ) {}

  /**
   * Called once after the WebSocket server is initialized.
   * Logs that the gateway has been initialized.
   *
   * @param {Server} server - The WebSocket server instance.
   */
  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  /**
   * Called when a client connects to the WebSocket server.
   * Authorizes the client based on the provided token and logs connection details.
   *
   * @param {Socket} client - The connected client socket.
   */
  handleConnection(client: Socket) {
    const { sockets } = this.server.sockets;
    const token = client.handshake.auth.token as string;
    const status = this.HandleAuthorizationClient(token, client);
    if (status) {
      this.logger.warn(`Client id: ${client.id} connected`);
    } else {
      this.logger.log(
        `Client id: ${client.id} tried to connect but was denied `,
      );
    }
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  /**
   * Called when a client disconnects from the WebSocket server.
   * Removes the client from the tracked list and logs the disconnection.
   *
   * @param {Socket} client - The disconnected client socket.
   */
  handleDisconnect(client: Socket) {
    this.clients.forEach((value, key) => {
      if (value.id === client.id) {
        this.clients.delete(key);
      }
    });
    this.logger.log(`Client id: ${client.id} disconnected`);
  }

  /**
   * Handles client authorization by validating the provided token.
   * Disconnects the client if the token is invalid.
   *
   * @param {string} token - The token provided by the client.
   * @param {Socket} client - The client socket to be authorized.
   */
  private HandleAuthorizationClient(token: string, client: Socket) {
    const accesstoken = this.config.get<string>('sockettoken');
    if (!token || token !== accesstoken) {
      client.emit('AuthError', {
        message: 'Authentication errors: Token required or invalid',
      });
      client.disconnect(true);
      return false;
    }
    return true;
  }

  /**
   * Emits a notification to a specific client and schedules a re-send if the client is not connected.
   *
   * @param {string} userId - The ID of the user to notify.
   * @param {RTechSystemNotificationType} data - The notification data to be sent.
   */
  async emitToClient(userId: string, data: RTechSystemNotificationType) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit(data.pattern, data);
      if (data.resendId) {
        await lastValueFrom(
          this.rmqService.emit(NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION, data),
        );
      } else {
        await lastValueFrom(
          this.rmqService.emit(
            NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION_SENT,
            data,
          ),
        );
      }
      return true;
    } else {
      this.logger.warn(`User id: ${userId} not logged in at the moment`);
      this.logger.log(
        `Automatic re-scheduling enabled for this user ${userId}`,
      );
      return false;
    }
  }

  /**
   * Handles login events by associating the client socket with the provided user ID.
   *
   * @param {Object} data - The login event data.
   * @param {string} data.userId - The user ID of the logged-in user.
   * @param {Socket} client - The client socket associated with the user.
   */
  @SubscribeMessage(NOTIFICATION_PATTERN.LOGIN)
  HandleLogin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(data);
    this.clients.set(data.userId, client);
    this.logger.log(
      `User id: ${data.userId} connected with client id: ${client.id}`,
    );
  }
}

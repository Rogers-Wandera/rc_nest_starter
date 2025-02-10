import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { corsOptions } from '../config/corsoptions';
import {
  NOTIFICATION_PATTERN,
  RabbitMQQueues,
  USER_EVENTS,
} from '../types/enums/enums';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';
import { EnvConfig } from '../config/config';

const sockets: Map<string, Socket> = new Map();

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

  getClients() {
    return sockets;
  }

  setClients(userId: string, client: Socket) {
    sockets.set(userId, client);
  }

  deleteClient(userId: string) {
    sockets.delete(userId);
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
      this.emitOnlineUsersToAdmin();
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
    sockets.forEach((value, key) => {
      console.log(client.id);
      if (value.id === client.id) {
        sockets.delete(key);
        this.rmqService.emit(NOTIFICATION_PATTERN.USER_LOGGED_OUT, {
          userId: key,
        });
      }
    });
    this.emitOnlineUsersToAdmin();
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
   * @param {string} pattern - The pattern to use for the notification.
   * @param {any} data - The notification data to be sent.
   */
  async emitToClient(
    userId: string,
    pattern: string,
    data: any,
    offlineCallBack: () => void = undefined,
  ) {
    const client = sockets.get(userId);
    if (client) {
      client.emit(pattern, data);
      return true;
    } else {
      if (offlineCallBack) {
        offlineCallBack();
      }
      this.logger.warn(
        `Emit to User id: ${userId} not logged in at the moment`,
      );
      return false;
    }
  }

  emitOnlineUsersToAdmin() {
    const onlineUsers = Array.from(sockets.keys());
    this.server.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
  }

  emit(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  uploadComplete(data: {
    progress: number;
    filename: string;
    meta: { userId: string; type?: string; [key: string]: any };
  }) {
    if (!data || !data?.meta?.userId) {
      return;
    }
    const client = sockets.get(data.meta.userId);
    if (client) {
      client.emit('upload_complete', {
        ...data,
        completed: true,
        failed: false,
        date: new Date(),
        title: data?.meta?.type || 'File Upload',
        message: `Your upload of file: ${data.filename} is complete`,
      });
      this.rmqService.setQueue(RabbitMQQueues.NOTIFICATIONS);
      this.rmqService.emit(NOTIFICATION_PATTERN.USER_NOTIFICATIONS, {
        userId: data.meta.userId,
      });
      return true;
    } else {
      this.logger.warn(
        `Emit to User id: ${data.meta.userId} not logged in at the moment`,
      );
      return false;
    }
  }
}

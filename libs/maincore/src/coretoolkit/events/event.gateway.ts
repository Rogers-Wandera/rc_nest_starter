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
import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnApplicationShutdown,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { corsOptions } from '../config/corsoptions';
import {
  NOTIFICATION_PATTERN,
  RabbitMQQueues,
  USER_EVENTS,
} from '../types/enums/enums';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';
import { EnvConfig } from '../config/config';
import { RedisConnection } from '../adapters/redis.adapter';
import { UserPresenceService } from '../services/online.user.service';
import { UserSessionService } from '../services/session.user.service';
import { UserAuthService } from './user_events/auth.eventservice';

/**
 * WebSocket gateway for managing client connections and handling system notifications.
 * Implements lifecycle hooks for WebSocket events and integrates with RabbitMQ for message handling.
 *
 * @class EventsGateway
 * @implements {OnGatewayConnection}
 * @implements {OnGatewayDisconnect}
 * @implements {OnGatewayInit}
 */
@Injectable({
  scope: Scope.DEFAULT,
})
@WebSocketGateway({
  cors: corsOptions,
})
export class EventsGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    BeforeApplicationShutdown,
    OnApplicationShutdown
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
    private readonly redisClient: RedisConnection,
    private userPresence: UserPresenceService,
    private readonly userSession: UserSessionService,
    private authService: UserAuthService,
  ) {}

  /**
   * Called once after the WebSocket server is initialized.
   * Logs that the gateway has been initialized.
   *
   * @param {Server} server - The WebSocket server instance.
   */
  afterInit(server: Server) {
    this.logger.log('Main Gateway initialized');
    this.userSession.mainServer = server;
    this.userPresence.mainServer = server;
  }

  async beforeApplicationShutdown(signal?: string) {
    this.logger.log('Server shutting down - cleaning up all connections');
  }

  async onApplicationShutdown(signal?: string) {
    // Final cleanup if needed
    this.logger.log(`Application shutdown complete (signal: ${signal})`);
  }

  async getClients(connectionId: string) {
    try {
      const socketIds = (await this.userPresence.getConnectionSockets(
        connectionId,
      )) as string[];
      return socketIds
        .map((socketId) => this.server.sockets.sockets.get(socketId))
        .filter((socket) => socket !== undefined) as Socket[];
    } catch (error) {
      this.logger.error(`Failed to get clients for ${connectionId}`, error);
      return [];
    }
  }

  /**
   * Called when a client connects to the WebSocket server.
   * Authorizes the client based on the provided token and logs connection details.
   *
   * @param {Socket} client - The connected client socket.
   */
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token as string;
    const connectionId = client.handshake.auth.connectionId as string;
    const sessionId = client.handshake.auth?.sessionId as string;
    const isAuthorized = this.HandleAuthorizationClient(
      token,
      connectionId,
      client,
    );
    if (!isAuthorized) return;
    try {
      if (sessionId) {
        client.join(sessionId);
        this.logger.log(
          `Client ${client.id} connected as ${connectionId} with session ${sessionId}`,
        );
      } else {
        this.logger.log(`Client ${client.id} connected as ${connectionId}`);
      }
      client.emit('call_connection', { success: true });
    } catch (error) {
      this.logger.error(`Connection tracking failed for ${client.id}`, error);
      client.disconnect(true);
    }
  }

  /**
   * Called when a client disconnects from the WebSocket server.
   * Removes the client from the tracked list and logs the disconnection.
   *
   * @param {Socket} client - The disconnected client socket.
   */
  async handleDisconnect(client: Socket) {
    try {
      this.logger.log(`Client ${client.id} disconnected`);
    } catch (error) {
      this.logger.error(
        `Disconnection tracking failed for ${client.id}`,
        error,
      );
    }
  }

  /**
   * Handles client authorization by validating the provided token.
   * Disconnects the client if the token is invalid.
   *
   * @param {string} token - The token provided by the client.
   * @param {Socket} client - The client socket to be authorized.
   */
  private HandleAuthorizationClient(
    token: string,
    connectionId: string,
    client: Socket,
  ) {
    const accessToken = this.config.get<string>('sockettoken');
    if (!token || token !== accessToken || !connectionId) {
      client.emit('AuthError', {
        message: 'Authentication error: Token required or invalid',
      });
      client.disconnect(true);
      return false;
    }
    if (connectionId.startsWith('micro:') || connectionId.startsWith('main:')) {
      return true;
    }
    client.emit('AuthError', {
      message: 'Invalid connection ID format',
    });
    client.disconnect(true);
    return true;
  }

  /**
   * Emits a notification to a specific client and schedules a re-send if the client is not connected.
   *
   * @param {string} connectionId - The ID of the user to notify.
   * @param {string} pattern - The pattern to use for the notification.
   * @param {any} data - The notification data to be sent.
   */
  async emitToClient(
    connectionId: string,
    pattern: string,
    data: any,
    offlineCallBack: () => void = undefined,
  ) {
    const sockets = (await this.userPresence.getConnectionSockets(
      connectionId,
    )) as string[];
    if (sockets?.length > 0) {
      sockets.forEach((socketId) => {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(pattern, data);
        }
      });
      return true;
    }
    if (offlineCallBack) {
      offlineCallBack();
    }
    this.logger.warn(`No active sockets found for ${connectionId}`);
    return false;
  }

  async emitOnlineUsersToAdmin() {
    const users = await this.userPresence.getOnlineUsers();
    this.server.emit(USER_EVENTS.ONLINE_USERS, users);
  }

  emit(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  async uploadComplete(data: {
    progress: number;
    filename: string;
    meta: { userId: string; type?: string; [key: string]: any };
  }) {
    if (!data?.meta?.userId) return false;

    const connectionId = `user:${data.meta.userId}`;
    const wasEmitted = await this.emitToClient(
      connectionId,
      'upload_complete',
      {
        ...data,
        completed: true,
        failed: false,
        date: new Date(),
        title: data?.meta?.type || 'File Upload',
        message: `Your upload of file: ${data.filename} is complete`,
      },
    );

    if (wasEmitted) {
      this.rmqService.setQueue(RabbitMQQueues.NOTIFICATIONS);
      this.rmqService.emit(NOTIFICATION_PATTERN.USER_NOTIFICATIONS, {
        userId: data.meta.userId,
      });
    }

    return wasEmitted;
  }

  async emitToSession(sessionId: string, pattern: string, data: any) {
    if (!sessionId) {
      this.logger.warn('Session ID is required to emit to session');
      return false;
    }
    if (this.server.sockets.sockets.size === 0) {
      this.logger.warn('No active sockets found to emit to session');
      return false;
    }
    try {
      // Check if any sockets are in the room (optional optimization)
      const room = this.server.sockets.adapter.rooms.get(sessionId);
      if (!room || room.size === 0) {
        this.logger.warn(`No active sockets found for session ${sessionId}`);
        return false;
      }
      // Emit to the room (all sockets in the room will receive it)
      this.server.to(sessionId).emit(pattern, data);
      this.logger.log(`Emitted "${pattern}" to session ${sessionId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to emit to session ${sessionId}: ${error.message}`,
      );
      return false;
    }
  }

  @SubscribeMessage('socket_session')
  async handleSocketSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    if (data?.sessionId) {
      socket.join(data.sessionId);
      this.logger.log(`Socket ${socket.id} joined session ${data.sessionId}`);
    }
  }

  @SubscribeMessage(USER_EVENTS.LOGOUT)
  async handleLogout(
    @MessageBody() data: { userId: string; sessionId: string },
  ) {
    await this.userSession.removeSession(data.userId, data.sessionId);
    return this.authService.handleLogout(data);
  }

  @SubscribeMessage(NOTIFICATION_PATTERN.GET_NOTIFICATIONS)
  HandleGetNotifications(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(data);
    client.broadcast.emit(NOTIFICATION_PATTERN.GET_NOTIFICATIONS, data);
  }
}

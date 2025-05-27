import {
  BeforeApplicationShutdown,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { corsOptions } from '../config/corsoptions';
import { UserPresenceService } from '../services/online.user.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config/config';
import { RedisConnection } from '../adapters/redis.adapter';
import { UserSessionService } from '../services/session.user.service';
import { UserAuthService } from './user_events/auth.eventservice';
import { USER_EVENTS } from '../types/enums/enums';
import { USER_JWT_EVENTS } from './user_events/jwt.eventsservice';

@WebSocketGateway({ namespace: '/user', cors: corsOptions })
export class UserGateWay
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    BeforeApplicationShutdown
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(UserGateWay.name);

  constructor(
    private userPresence: UserPresenceService,
    private readonly config: ConfigService<EnvConfig>,
    private readonly redisClient: RedisConnection,
    private readonly userSession: UserSessionService,
    private authService: UserAuthService,
    private readonly jwtService: USER_JWT_EVENTS,
  ) {}

  async afterInit(server: Server) {
    this.logger.log('User Gateway initialized');
    this.userPresence.server = server;
    this.userSession.server = server;
  }

  async beforeApplicationShutdown(signal?: string) {
    this.logger.log(
      'Server shutting down - cleaning up all user connections with signal: ' +
        signal,
    );
    await this.userPresence.clearAllConnections();
    await this.userSession.clearAllSessions();
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token as string;
    const connectionId = client.handshake.auth.connectionId as string;
    const jwt = client.handshake.auth.jwt as string;

    const isAuthorized = this.HandleAuthorizationClient(
      token,
      connectionId,
      client,
    );
    if (!isAuthorized) return;
    if (!jwt) {
      client.disconnect(true);
      return;
    }
    try {
      await this.userPresence.connectionEstablished(connectionId, client.id);
      this.logger.log(`User Socket ${client.id} connected as ${connectionId}`);
      //   if (connectionId.startsWith('user:')) {
      //     this.rmqService.emit(NOTIFICATION_PATTERN.USER_LOGGED_IN, {
      //       userId: connectionId.replace('user:', ''),
      //     });
      //   }
    } catch (error) {
      this.logger.error(`Connection tracking failed for ${client.id}`, error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const connectionId = await this.userPresence.connectionTerminated(
        client.id,
      );
      if (connectionId) {
        this.logger.log(
          `User Socket ${client.id} (${connectionId}) disconnected`,
        );
        await this.authService.HandleUserOffline({
          userId: connectionId.replace('user:', ''),
        });

        // if (connectionId.startsWith('user:')) {
        //   this.rmqService.emit(NOTIFICATION_PATTERN.USER_LOGGED_OUT, {
        //     userId: connectionId.replace('user:', ''),
        //   });
        //   await this.emitOnlineUsersToAdmin();
        // }
      }
    } catch (error) {
      this.logger.error(
        `Disconnection tracking failed for ${client.id}`,
        error,
      );
    }
  }

  private HandleAuthorizationClient(
    token: string,
    connectionId: string,
    client: Socket,
  ) {
    const accessToken = this.config.get<string>('sockettoken');
    if (!token || token !== accessToken || !connectionId) {
      client.emit('AuthError', {
        message:
          'Authentication error: Token required or invalid token or connection ID required',
      });
      client.disconnect(true);
      return false;
    }
    if (!connectionId.startsWith('user:')) {
      client.emit('AuthError', {
        message: 'Invalid connection ID format',
      });
      client.disconnect(true);
      return false;
    }
    return true;
  }

  @SubscribeMessage(USER_EVENTS.LOGOUT)
  async handleLogout(
    @MessageBody() data: { userId: string; sessionId: string },
  ) {
    await this.userSession.removeSession(data.userId, data.sessionId);
    return this.authService.handleLogout(data);
  }

  @SubscribeMessage(USER_EVENTS.UPDATE_SESSION)
  async HandleUpdateUserSession(
    @MessageBody() data: { userId: string; sessionId?: string },
  ) {
    const userId = data.userId;
    const token = await this.jwtService.HandleUpdateUserSession(data);
    if (token) {
      if (data?.sessionId) {
        await this.userSession.updateSession(userId, data.sessionId, token);
        return { token, message: 'Your session has been updated' };
      } else {
        await this.userSession.updateAllUserSessions(userId, token);
        const userSockets = await this.userPresence.getUserSockets(userId);
        if (userSockets && userSockets.length > 0) {
          userSockets.forEach((socket) => {
            socket.emit(USER_EVENTS.UPDATE_SESSION, {
              token,
              message:
                'Your session has been updated, some configurations have changed',
            });
          });
        }
      }
    }
  }

  @SubscribeMessage(USER_EVENTS.FETCH_MODULES)
  handleFetchModules(
    @MessageBody()
    data: {
      userId?: string;
      groupId?: number;
      name: string;
      infotype: string;
    },
  ) {
    return this.authService.handleFetchModules(data);
  }

  @SubscribeMessage(USER_EVENTS.IS_LOGGED_IN)
  async HandleIsLoggedIn(@MessageBody() data: { userId: string }) {
    return this.authService.HandleIsLoggedIn(data);
  }

  @SubscribeMessage(USER_EVENTS.USER_OFFLINE)
  HandleUserOffline(@MessageBody() data: { userId: string; manual?: boolean }) {
    return this.authService.HandleUserOffline(data);
  }
}

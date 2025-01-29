import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { corsOptions } from '../../config/corsoptions';
import { EventsGateway } from '../event.gateway';
import { NOTIFICATION_PATTERN, USER_EVENTS } from '../../types/enums/enums';
import { CustomRepository } from '@core/maincore/databridge/ormextender/customrepository';
import { User } from '@core/maincore/entities/core/users.entity';
import { DataBridgeService } from '@core/maincore/databridge/databridge.service';
import { RabbitMQService } from '../../micro/microservices/rabbitmq.service';

@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class UserEventsService {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger();
  private userservice: CustomRepository<User>;

  /**
   * Creates an instance of `EventsGateWayService`.
   *
   * @param {EventsGateway} events - Service for emitting events to clients.
   */
  constructor(
    @Inject('EventsGateway') private readonly events: EventsGateway,
    @Inject('data_source') private readonly source: DataBridgeService,
    private readonly rmqService: RabbitMQService,
  ) {
    this.userservice = this.source.GetRepository(User);
  }

  @SubscribeMessage(USER_EVENTS.UPDATE_SESSION)
  async HandleUpdateUserSession(
    @MessageBody() data: any,
  ): Promise<WsResponse | undefined> {
    return { event: USER_EVENTS.UPDATE_SESSION, data };
  }

  @SubscribeMessage(USER_EVENTS.LOGOUT)
  async handleLogout(@MessageBody() data: { userId: string }) {
    const user = await this.userservice.findOneBy({ id: data.userId });
    if (user) {
      user.lastloginDate = new Date();
      user.online = 0;
      await this.userservice.save(user);
      this.rmqService.emit(NOTIFICATION_PATTERN.USER_LOGGED_OUT, {
        userId: user.id,
        manual: true,
      });
    }
    return data;
  }

  @SubscribeMessage(USER_EVENTS.FETCH_MODULES)
  handleFetchModules(@MessageBody() data: any) {}

  @SubscribeMessage(USER_EVENTS.USER_OFFLINE)
  async HandleUserOffline(
    @MessageBody() data: { userId: string; manual?: boolean },
  ) {
    try {
      const user = await this.userservice.findOneBy({ id: data.userId });
      if (user) {
        user.online = 0;
        if (!data?.manual) {
          user.lastloginDate = new Date();
        }
        await this.userservice.save(user);
      }
      const socketThere = this.events.getClients().has(data.userId);
      if (socketThere) {
        this.events.deleteClient(data.userId);
      }
      const onlineUsers = Array.from(this.events.getClients().keys());
      this.server.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
    } catch (error) {
      this.logger.error('Error while setting offline');
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
  async HandleLogin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.events.setClients(data.userId, client);
      const user = await this.userservice.findOneBy({ id: data.userId });
      if (user) {
        user.online = 1;
        await this.userservice.save(user);
      }
      this.rmqService.emit(NOTIFICATION_PATTERN.USER_LOGGED_IN, {
        userId: data.userId,
      });
      this.logger.log(
        `User id: ${data.userId} connected with client id: ${client.id}`,
      );
    } catch (error) {
      this.logger.error('Error while logging the user');
    }
  }

  @SubscribeMessage(USER_EVENTS.IS_LOGGED_IN)
  async HandleIsLoggedIn(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const findSocket = this.events.getClients().get(data.userId);
    let message: Record<string, any> = {};
    if (findSocket?.id === client.id) {
      message = {
        success: true,
        message: 'User already logged in with the same socket.',
      };
    } else {
      const user = await this.userservice.findOneBy({ id: data.userId });
      if (user) {
        user.online = 1;
        await this.userservice.save(user);
      }
      // Replace the socket if user refreshed or reconnected
      this.events.setClients(data.userId, client);
      this.rmqService.emit(NOTIFICATION_PATTERN.USER_LOGGED_IN, {
        userId: data.userId,
      });
      this.logger.verbose(
        `User ${data.userId} reconnected with new socket ID: ${client.id}`,
      );
      message = { success: true, message: 'User socket updated successfully.' };
    }
    const onlineUsers = Array.from(this.events.getClients().keys());
    this.server.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
    return message;
  }

  @SubscribeMessage(USER_EVENTS.GET_ONLINE_USERS)
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const onlineUsers = Array.from(this.events.getClients().keys());
    client.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
  }
}

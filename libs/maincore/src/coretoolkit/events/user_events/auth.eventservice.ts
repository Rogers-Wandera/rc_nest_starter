import { Inject, Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { EventsGateway } from '../event.gateway';
import {
  INJECTABLES,
  NOTIFICATION_PATTERN,
  RabbitMQQueues,
  USER_EVENTS,
} from '../../types/enums/enums';
import { CustomRepository } from '@core/maincore/databridge/ormextender/customrepository';
import { User } from '@core/maincore/entities/core/users.entity';
import { DataBridgeService } from '@core/maincore/databridge/databridge.service';
import { RabbitMQService } from '../../micro/microservices/rabbitmq.service';
import { EventLogger } from '../../app/utils/event.logger';
import { UserGroupMember } from '@core/maincore/entities/core/usergroupmembers.entity';

@Injectable()
export class UserAuthService {
  private logger: Logger = new Logger(UserAuthService.name);
  private userservice: CustomRepository<User>;
  private memberrepository: CustomRepository<UserGroupMember>;

  constructor(
    private readonly events: EventsGateway,
    @Inject(INJECTABLES.DATA_SOURCE) private readonly source: DataBridgeService,
    private readonly rmqService: RabbitMQService,
    private readonly eventlogger: EventLogger,
  ) {
    this.userservice = this.source.GetRepository(User);
    this.memberrepository = this.source.GetRepository(UserGroupMember);
  }

  async handleLogout(data: { userId: string }) {
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

  async handleFetchModules(data: {
    userId?: string;
    groupId?: number;
    name: string;
    infotype: string;
  }) {
    if (data?.userId) {
      const socket = this.events.getClients().get(data.userId);
      if (socket) {
        socket.emit(USER_EVENTS.FETCH_MODULES, {
          message: `You now have access to the ${data.name} link`,
        });
      }
    } else if (data?.groupId) {
      const members = await this.memberrepository.find({
        where: { group: { id: data.groupId } },
      });
      if (members?.length > 0) {
        const ids = members.map((member) => member?.user?.id).filter(Boolean);
        ids.forEach((id) => {
          const socket = this.events.getClients().get(id);
          if (socket) {
            socket.emit(USER_EVENTS.FETCH_MODULES, {
              message: `The ${data.name} link has been ${data.infotype}`,
            });
          }
        });
      }
    } else {
      return;
    }
  }

  async HandleUserOffline(data: { userId: string; manual?: boolean }) {
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
        this.eventlogger.logEvent(`User Logged Off`, 'user_events', {
          userId: data.userId,
          eventType: 'USER_OFFLINE',
        });
      }
      const onlineUsers = Array.from(this.events.getClients().keys());
      this.events.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
    } catch (error) {
      this.logger.error('Error while setting offline');
    }
  }

  async HandleLogin(data: { userId: string }, client: Socket) {
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
      this.eventlogger.logEvent(`User Logged In`, 'user_events', {
        userId: data.userId,
        eventType: 'LOGIN',
      });
    } catch (error) {
      this.logger.error('Error while logging the user');
    }
  }

  async HandleIsLoggedIn(data: { userId: string }, client: Socket) {
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
      this.rmqService.setQueue(RabbitMQQueues.NOTIFICATIONS);
      this.rmqService.emit(NOTIFICATION_PATTERN.USER_LOGGED_IN, {
        userId: data.userId,
      });
      this.logger.verbose(
        `User ${data.userId} reconnected with new socket ID: ${client.id}`,
      );
      this.eventlogger.logEvent(
        `User Socket Reconnected to the server`,
        'user_events',
        { userId: data.userId, eventType: 'RECONNECTED' },
      );
      message = { success: true, message: 'User socket updated successfully.' };
    }
    const onlineUsers = Array.from(this.events.getClients().keys());
    this.events.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
    return message;
  }
}

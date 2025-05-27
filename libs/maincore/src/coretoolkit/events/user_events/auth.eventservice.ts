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
import { UserPresenceService } from '../../services/online.user.service';

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
    private readonly userPresence: UserPresenceService,
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
    }
    return data;
  }

  async handleFetchModules(data: {
    userId?: string;
    groupId?: number;
    infotype?: string;
  }) {
    if (data?.userId) {
      const usersockets = await this.userPresence.getUserSockets(data.userId);
      if (usersockets?.length > 0) {
        usersockets.forEach((socket) => {
          socket.emit(USER_EVENTS.FETCH_MODULES, {
            message: data?.infotype || 'Some configuration have been changed',
          });
        });
      }
    } else if (data?.groupId) {
      const members = await this.memberrepository.find({
        where: { group: { id: data.groupId } },
      });
      if (members?.length > 0) {
        const ids = members.map((member) => member?.user?.id).filter(Boolean);
        ids.forEach(async (id) => {
          const usersockets = await this.userPresence.getUserSockets(id);
          if (usersockets?.length > 0) {
            usersockets.forEach((socket) => {
              socket.emit(USER_EVENTS.FETCH_MODULES, {
                message:
                  data?.infotype || 'Some configuration have been changed',
              });
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
    } catch (error) {
      this.logger.error('Error while setting offline');
    }
  }

  async HandleLogin(data: { userId: string; sessionId: string }) {
    try {
      const user = await this.userservice.findOneBy({ id: data.userId });
      if (user) {
        user.online = 1;
        await this.userservice.save(user);
      }
      this.eventlogger.logEvent(`User Logged In`, 'user_events', {
        userId: data.userId,
        eventType: 'LOGIN',
        data: {
          sessionId: data.sessionId,
        },
      });
    } catch (error) {
      this.logger.error('Error while logging the user');
    }
  }

  async HandleIsLoggedIn(data: { userId: string }) {
    const user = await this.userservice.findOneBy({ id: data.userId });
    if (user) {
      user.online = 1;
      await this.userservice.save(user);
    }
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { WsResponse } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { INJECTABLES, USER_EVENTS } from '../../types/enums/enums';
import { DataBridgeService } from '@core/maincore/databridge/databridge.service';
import { CustomRepository } from '@core/maincore/databridge/ormextender/customrepository';
import { RefreshToken } from '@core/maincore/entities/core/refreshtokens.entity';
import { UserDataView } from '@core/maincore/entities/coreviews/userdata.view';
import { UserRolesView } from '@core/maincore/entities/coreviews/userroles.view';
import { DataUtils } from '@core/maincore/databridge/databuilder/data.util';
import { EventLogger } from '../../app/utils/event.logger';
import { EventsGateway } from '../event.gateway';

@Injectable()
export class USER_JWT_EVENTS extends DataUtils {
  private refreshRepository: CustomRepository<RefreshToken>;
  private userRepository: CustomRepository<UserDataView>;
  constructor(
    private readonly jwtService: JwtService,
    @Inject(INJECTABLES.DATA_SOURCE) private readonly source: DataBridgeService,
    private readonly eventslogger: EventLogger,
    private readonly events: EventsGateway,
  ) {
    super();
    this.refreshRepository = this.source.GetRepository(RefreshToken);
    this.userRepository = this.source.GetRepository(UserDataView);
  }

  async HandleUpdateUserSession(data: {
    userId: string;
    isUser?: boolean;
  }): Promise<WsResponse | undefined> {
    try {
      const refreshToken = await this.refreshRepository.findOneBy({
        user: { id: data.userId },
      });
      if (!refreshToken) {
        return null;
      }
      const user = await this.userRepository.findOneBy({ id: data.userId });
      if (!user) {
        return null;
      }
      const dbroles = await this.userRepository.manager.find(UserRolesView, {
        where: { userId: user.id },
      });
      const roles = dbroles.map((r) => r.role);
      await this.jwtService.verifyAsync(refreshToken.token);
      const payload = this.jwtPayload(user, roles);
      const token = await this.jwtService.signAsync(payload);
      if (data?.isUser) {
        this.eventslogger.logEvent(`User Session Updated`, 'user_events', {
          userId: data.userId,
          eventType: 'UPDATE_SESSION',
        });
        return { event: USER_EVENTS.UPDATE_SESSION, data: { token } };
      }
      const socket = this.events.getClients().get(data.userId);
      if (socket) {
        socket.emit(USER_EVENTS.UPDATE_SESSION, {
          token,
          message:
            'Your session has been updated because some configurations have been changed',
        });
        this.eventslogger.logEvent(`User Session Updated`, 'user_events', {
          userId: data.userId,
          eventType: 'UPDATE_SESSION',
        });
        return;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private readonly jwtPayload = (user: UserDataView, roles: number[]) => {
    return {
      user: {
        id: user.id,
        isLocked: user.isLocked,
        roles: roles,
        verified: user.verified,
        adminCreated: user.adminCreated,
        displayName: user.userName,
        position: user.position,
        image: this.encryptData(user.image),
      },
      sub: user.id,
    };
  };
}

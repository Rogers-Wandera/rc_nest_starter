import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { RefreshToken } from '@entity/entities/core/refreshtokens.entity';
import { UserService } from '../users/users.service';
import { UserDataView } from '@entity/entities/coreviews/userdata.view';
import { UserRolesView } from '@entity/entities/coreviews/userroles.view';
import { ServerRolesView } from '@entity/entities/coreviews/serverroute.view';
import { ServerRolesType } from '../../../types/auth.types';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';

@Injectable()
export class RefreshTokenService extends EntityModel<RefreshToken> {
  constructor(
    @Inject(EntityDataSource) source: EntityDataSource,
    @Inject(forwardRef(() => UserService))
    private readonly user: UserService,
  ) {
    super(RefreshToken, source);
  }
  private async GetServerRoles(user: UserDataView): Promise<ServerRolesType[]> {
    const serveraccess = await this.model
      .getRepository(ServerRolesView)
      .find({ where: { userId: user.id, expired: 0 } });
    if (serveraccess.length > 0) {
      const res: ServerRolesType[] = serveraccess.map((data) => {
        return {
          roleName: data.roleName,
          roleValue: data.roleValue,
          expired: data.expired,
          days_left: data.days_left,
          userId: data.userId,
          method: data.method,
        };
      });
      return res;
    }
    return [];
  }
  async ViewSingleRefreshtoken(userId: string): Promise<RefreshToken> {
    const token = await this.repository.findOneBy({
      user: { id: userId },
    });
    this.entity = token;
    if (!token) {
      throw new UnauthorizedException('No token found for this account');
    }
    return token;
  }
  //   add function
  async AddRefreshtokens() {
    try {
      const exists = await this.repository.findOne({
        where: {
          user: { id: this.entity.user.id },
        },
        relations: { user: true },
      });
      if (exists) {
        exists.token = this.entity.token;
        const res = await this.repository.save(exists);
        return res;
      }
      const results = await this.repository.save(this.entity);
      return results;
    } catch (error) {
      throw new Error(error);
    }
  }

  HandleRefreshToken = async (user: UserDataView) => {
    const dbroles = await this.model.manager.find(UserRolesView, {
      where: { userId: user.id },
    });
    const roles = dbroles.map((r) => r.role);
    const serverroles = await this.GetServerRoles(user);
    const token = await this.user.getToken(user, roles, serverroles);
    return { token };
  };
}

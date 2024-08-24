import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { RefreshToken } from '../../../../entities/core/refreshtokens.entity';
import { UserService } from '../users/users.service';
import { UserDataView } from '../../../../entities/coreviews/userdata.view';
import { UserRolesView } from '../../../../entities/coreviews/userroles.view';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';

@Injectable()
export class RefreshTokenService extends EntityModel<RefreshToken> {
  constructor(
    @Inject(EntityDataSource) source: EntityDataSource,
    @Inject(forwardRef(() => UserService))
    private readonly user: UserService,
  ) {
    super(RefreshToken, source);
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
    const token = await this.user.getToken(user, roles);
    return { token };
  };
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { Token } from '@entity/entities/core/tokens.entity';

@Injectable()
export class TokenService extends EntityModel<Token> {
  constructor(@Inject(EntityDataSource) source: EntityDataSource) {
    super(Token, source);
  }

  async CreateToken() {
    try {
      const activeTokens = await this.repository.find({
        where: {
          user: { id: this.entity.user.id },
          isActive: 1,
          tokenType: this.entity.tokenType,
        },
      });
      if (activeTokens.length > 0) {
        const promises = activeTokens.map((token) => {
          return this.repository.FindOneAndUpdate(
            { id: token.id },
            { isActive: 0 },
          );
        });
        await Promise.all(promises);
      }
      return await this.repository.save(this.entity);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async DeactivateUserToken(userId: string) {
    try {
      const token = await this.repository.findOneBy({
        user: { id: userId },
        isActive: 1,
        token: this.entity.token,
        tokenType: this.entity.tokenType,
      });
      if (token) {
        token.isActive = 0;
        await this.repository.save(token);
      }
      return token;
    } catch (error) {
      throw error;
    }
  }

  async CheckTokenExpiry() {
    try {
      const token = await this.repository.findOneBy({
        user: { id: this.entity.user.id },
        isActive: 1,
        token: this.entity.token,
        tokenType: this.entity.tokenType,
      });
      if (token) {
        const isTokenExpired = this.checkExpireDate(token.expire);
        return { isExpired: isTokenExpired, token };
      }
      throw new BadRequestException('No token found for this user');
    } catch (error) {
      throw error;
    }
  }

  async GetUserToken(userId: string) {
    const token = await this.repository.findOne({
      where: {
        user: { id: userId },
        isActive: 1,
        tokenType: this.entity.tokenType,
      },
    });
    if (!token) {
      throw new BadRequestException('No token found for this user');
    }
    return token;
  }
}

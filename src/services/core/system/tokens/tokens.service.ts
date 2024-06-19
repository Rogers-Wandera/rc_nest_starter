import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/entity/core/tokens.entity';
import { EntityDataSource } from 'src/model/enity.data.model';
import { EntityModel } from 'src/model/entity.model';

@Injectable()
export class TokenService extends EntityModel<Token> {
  constructor(@Inject(EntityDataSource) source: EntityDataSource) {
    super(Token, source);
  }

  async CreateToken() {
    try {
      return await this.repository.save(this.entity);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.provider';
import { Token } from 'src/entity/core/tokens.entity';
import { EntityModel } from 'src/model/entity.model';

@Injectable()
export class TokenService extends EntityModel<Token> {
  constructor(@Inject('data_source') model: DatabaseService) {
    super(Token, model);
  }

  async CreateToken() {
    try {
      return await this.repository.save(this.entity);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

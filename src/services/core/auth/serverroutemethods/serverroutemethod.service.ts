import { Injectable } from '@nestjs/common';
import { ServerRouteMethod } from 'src/entity/core/serverroutemethods.entity';
import { EntityDataSource } from 'src/model/enity.data.model';
import { EntityModel } from 'src/model/entity.model';

@Injectable()
export class ServerRouteMethodService extends EntityModel<ServerRouteMethod> {
  constructor(source: EntityDataSource) {
    super(ServerRouteMethod, source);
  }

  async AddMethod() {
    try {
      const response = await this.repository.save(this.entity);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async DeleteMethod() {
    try {
      const response = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      return response.affected === 1;
    } catch (error) {
      throw error;
    }
  }
  async RestoreMethod() {
    try {
      const response = await this.repository.restoreDelete({
        id: this.entity.id,
      });
      return response.affected === 1;
    } catch (error) {
      throw error;
    }
  }
}

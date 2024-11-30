import { Injectable } from '@nestjs/common';
import { ModelService } from './model/model.service';
import { Model } from './model/model';
import { ConfigOptions } from './config/config';
import { EntityTarget, ObjectLiteral } from 'typeorm';
import { CustomRepository } from './ormextender/customrepository';

@Injectable()
export class DataBridgeService {
  private modelServiceInstance: ModelService;
  constructor() {
    this.modelServiceInstance = new ModelService(new Model(ConfigOptions()));
  }
  public getModel<T>(caller: T): Model {
    return this.modelServiceInstance.getModel(caller);
  }

  public close(): Promise<void> {
    return this.modelServiceInstance.close();
  }

  public initialize(): Promise<void> {
    return this.modelServiceInstance.initialize();
  }
  public GetRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): CustomRepository<T> {
    return this.modelServiceInstance.getModel('pass').getRepository(entity);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ModelService } from './model/model.service';
import { Model } from './model/model';
import { DataSourceOptions, EntityTarget, ObjectLiteral } from 'typeorm';
import { CustomRepository } from './ormextender/customrepository';

@Injectable()
export class DataBridgeService {
  private modelServiceInstance: ModelService;
  constructor(@Inject('RDATABASE_CONFIG') config: DataSourceOptions) {
    this.modelServiceInstance = new ModelService(new Model(config));
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

import { BadRequestException } from '@nestjs/common';
import { MODEL_CLASS_KEY } from '../decorators/model.decorator';
import { EntityModel } from './entity.model';
import { MainDBBuilder } from '../ormextender/mainbuilder';
import { DataSource } from 'typeorm';

export class ModelService extends MainDBBuilder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }
  protected getCallerInfo<T>(caller: T) {
    const EntityModelPrototype = EntityModel.prototype;
    let isEntityModelPrototype = false;
    if (Object.prototype.isPrototypeOf.call(EntityModelPrototype, caller)) {
      isEntityModelPrototype = true;
    }
    const metadata = Reflect.getMetadata(MODEL_CLASS_KEY, caller);
    return {
      className: caller.constructor.name,
      isEntityModel: isEntityModelPrototype,
      metadata: metadata,
    };
  }

  public getModel<T>(caller: T | 'pass'): MainDBBuilder {
    try {
      if (caller === 'pass') {
        return this;
      }
      const data = this.getCallerInfo(caller);
      if (data.isEntityModel && data.metadata) {
        return this;
      }
      throw new BadRequestException(
        `Direct calls to the model are not allowed, only call model in the entity class, check class ${data.className}`,
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

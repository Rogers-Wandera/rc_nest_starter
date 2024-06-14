import { MODEL_CLASS_KEY } from '../decorators/model.decorators';
import { EntityModel } from '../../model/entity.model';
import { Model } from '../../model/model';
import { CustomAppError } from './app.error';

export class ModelService {
  constructor(protected modelInstance: Model) {}
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

  public async initialize(): Promise<void> {
    await this.modelInstance.initialize();
  }
  public getModel<T>(caller: T): Model {
    try {
      const data = this.getCallerInfo(caller);
      if (data.isEntityModel && data.metadata) {
        return this.modelInstance;
      }
      throw new CustomAppError(
        `Direct calls to the model are not allowed, only call model in the entity class, check class ${data.className}`,
        500,
      );
    } catch (error) {
      throw new CustomAppError(error.message, 500);
    }
  }

  public async close() {
    await this.modelInstance.destroy();
  }
}

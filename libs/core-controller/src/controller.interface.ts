import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { BaseEntityClass } from '@entity/entities/base.entity';

export interface ControllerInterface {
  model: EntityModel<BaseEntityClass>;
}

export abstract class IController<T extends EntityModel<any>> {
  protected readonly model: T;
  constructor(model: T) {
    this.model = model;
  }
  View?(...args: any): unknown | void;
  Update?(...args: any): unknown | void;
  Delete?(...args: any): unknown | void;
  Create?(...args: any): unknown | void;
}

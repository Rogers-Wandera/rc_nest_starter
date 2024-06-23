import { EntityModel } from 'src/model/entity.model';

export interface ControllerInterface {
  model: EntityModel<unknown>;
}

export abstract class IController<T extends EntityModel<any>> {
  protected readonly model: T;
  constructor(model: T) {
    this.model = model;
  }
  View?(...args): unknown | void;
  Update?(...args): unknown | void;
  Delete?(...args): unknown | void;
  Create?(...args): unknown | void;
}

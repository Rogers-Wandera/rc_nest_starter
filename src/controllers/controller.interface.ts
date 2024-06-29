import { EntityModel } from 'src/model/entity.model';

export interface ControllerInterface {
  model: EntityModel<unknown>;
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

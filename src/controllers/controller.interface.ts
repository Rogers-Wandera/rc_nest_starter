import { EntityModel } from 'src/model/entity.model';

export interface ControllerInterface {
  model: EntityModel<unknown>;
}

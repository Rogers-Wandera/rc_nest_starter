import { ModelService } from '../app/context/model.context';
import { Model } from '../model/model';
import { ConfigOptions } from './configs';

export class DatabaseService {
  private modelServiceInstance: ModelService;
  constructor() {
    // this.modelInstance = new Model(config);
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
}

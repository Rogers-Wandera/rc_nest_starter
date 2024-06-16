import { EntityTarget, ObjectLiteral } from 'typeorm';
import { Model } from './model';
import { CustomRepository } from '../app/conn/customrepository';
import { customquerypaginateprops, paginateprops } from '../app/conn/conntypes';
import { CustomAppError } from '../app/context/app.error';
import { Utilities } from '../app/utils/app.utils';
import { DatabaseService } from '../db/database.provider';
import { ModelClass } from 'src/app/decorators/model.decorators';

@ModelClass()
export class EntityModel<T extends ObjectLiteral> extends Utilities {
  protected model: Model;
  protected repository: CustomRepository<T>;
  public pagination: paginateprops<T>;
  public entity: T;
  public custompagination: customquerypaginateprops<T>;
  constructor(
    entity: EntityTarget<T>,
    private readonly modelservice: DatabaseService,
  ) {
    super();
    this.model = this.modelservice.getModel(this);
    this.entity = this.entityInstance(entity);
    this.repository = this.model.getRepository(entity);
    this.pagination = {} as paginateprops<T>;
    this.custompagination = {} as customquerypaginateprops<T>;
  }

  private entityInstance(entity: EntityTarget<T>): T {
    return Object.assign(new (entity as { new (): T })());
  }

  public async FindOne(conditions: Partial<T>): Promise<T> {
    try {
      const data = await this.repository.findOneByConditions(conditions);
      return data;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
    }
  }

  public async ViewAll(): Promise<T[]> {
    try {
      const results = await this.repository.find();
      return results;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
    }
  }

  protected getRepository(): CustomRepository<T> {
    return this.repository;
  }
}

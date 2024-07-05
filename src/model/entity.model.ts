import { EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { Model } from './model';
import { CustomRepository } from '../app/conn/customrepository';
import { paginateprops } from '../app/conn/conntypes';
import { CustomAppError } from '../app/context/app.error';
import { Utilities } from '../app/utils/app.utils';
import { ModelClass } from 'src/app/decorators/model.decorators';
import { EntityDataSource } from './enity.data.model';

@ModelClass()
export class EntityModel<T extends ObjectLiteral> extends Utilities {
  protected model: Model;
  protected repository: CustomRepository<T>;
  public pagination: paginateprops<T>;
  public entity: T;
  constructor(
    entity: EntityTarget<T>,
    private readonly datasource: EntityDataSource,
  ) {
    super();
    this.model = this.datasource.model.getModel(this);
    this.model.setRequest(this.datasource.request);
    this.entity = this.entityInstance(entity);
    this.repository = this.model.getRepository(entity);
    this.pagination = {} as paginateprops<T>;
  }

  private entityInstance(entity: EntityTarget<T>): T {
    return Object.assign(new (entity as { new (): T })());
  }

  public async FindOne(conditions: FindOptionsWhere<T>): Promise<T> {
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

  protected async CustomPaginateData<R extends ObjectLiteral>(
    query: string,
    params: (string | number)[] = [],
  ) {
    const pagination: paginateprops<R> = this
      .pagination as unknown as paginateprops<R>;
    return this.model.__viewCustomPaginateData({
      query: query,
      queryParams: params,
      limit: this.pagination.limit || 10,
      page: pagination.page || 1,
      filters: pagination.filters || [],
      sortBy: pagination.sortBy || [{ id: 'id', desc: true }],
      globalFilter: pagination.globalFilter,
    });
  }

  protected transformPaginateProps<R>() {
    const pagination: paginateprops<R> = this
      .pagination as unknown as paginateprops<R>;
    return pagination;
  }
}

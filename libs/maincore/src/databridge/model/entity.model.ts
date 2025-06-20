import { EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { CustomRepository } from '../ormextender/customrepository';
import { ModelClass } from '../decorators/model.decorator';
import { EntityDataSource } from './enity.data.model';
import { BadGatewayException } from '@nestjs/common';
import { DataUtils } from '../databuilder/data.util';
import { paginateprops } from '../../coretoolkit/types/coretypes';
import { BaseEntityClass } from '../../entities/base.entity';
import { MainDBBuilder } from '../ormextender/mainbuilder';

@ModelClass()
export class EntityModel<
  T extends BaseEntityClass<R>,
  R extends string | number = number,
> extends DataUtils {
  protected model: MainDBBuilder;
  protected repository: CustomRepository<T>;
  public pagination: paginateprops<T>;
  public entity: T;
  constructor(
    entity: EntityTarget<T>,
    private readonly datasource: EntityDataSource,
  ) {
    super();
    this.model = this.datasource.getModel(this);
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
      throw new BadGatewayException(error.message);
    }
  }

  public async ViewAll(): Promise<T[]> {
    try {
      const results = await this.repository.find();
      return results;
    } catch (error) {
      throw new BadGatewayException(error.message);
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

  protected PaginateView<R extends ObjectLiteral>(
    view: EntityTarget<R>,
    conditions?: FindOptionsWhere<R>,
  ) {
    const paginate = this.transformPaginateProps<R>();
    paginate.conditions = conditions;
    const repository = this.model.getRepository(view);
    return repository.Paginate(paginate);
  }
}

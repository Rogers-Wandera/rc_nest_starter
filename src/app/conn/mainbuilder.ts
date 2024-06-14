import {
  DataSource,
  DataSourceOptions,
  EntityMetadata,
  EntityTarget,
  ObjectLiteral,
} from 'typeorm';
import { CustomRepository, repositoryextender } from './customrepository';
import { CustomAppError } from '../context/app.error';

export class MainDBBuilder extends DataSource {
  constructor(options: DataSourceOptions) {
    super(options);
  }

  getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): CustomRepository<T> {
    return super.getRepository(entity).extend({
      ...repositoryextender(entity, this.manager),
    });
  }
  async getColumns<T extends ObjectLiteral>(
    query: string,
    queryParams: (string | number)[],
  ): Promise<string[]> {
    const result: T[] = await this.query(query, queryParams);
    return Object.keys(result[0] || []);
  }

  async getTotalDocs(
    query: string,
    queryValues: (string | number)[],
  ): Promise<number> {
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countQuery`;
    const result = await this.query(countQuery, queryValues);
    return parseInt(result[0].total, 10);
  }

  async getColumnsQuery<T>(entity: EntityTarget<T>): Promise<string[]> {
    try {
      const repository = this.getRepository(entity);
      const metadata: EntityMetadata = repository.metadata;
      const columns: string[] = metadata.columns.map((col) => col.propertyName);
      return columns;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
    }
  }

  async executeQuery<T extends ObjectLiteral>(
    query: string,
    params: (string | number)[],
  ): Promise<T[]> {
    try {
      const response = await this.query<T[]>(query, params);
      return response;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
    }
  }
}

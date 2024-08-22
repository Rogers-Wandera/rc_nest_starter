import {
  DataSource,
  DataSourceOptions,
  EntityMetadata,
  EntityTarget,
  ObjectLiteral,
} from 'typeorm';
import { CustomRepository } from './customrepository';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

/**
 * MainDBBuilder class extends the TypeORM DataSource to provide custom repository functionality
 * and various utility methods for database operations.
 */
export class MainDBBuilder extends DataSource {
  /**
   * The request object associated with the current context.
   * @protected
   * @type {Request}
   */
  protected request: Request = undefined;

  /**
   * Initializes the MainDBBuilder with the given data source options.
   *
   * @param {DataSourceOptions} options - The options for configuring the data source.
   */
  constructor(options: DataSourceOptions) {
    super(options);
  }

  /**
   * Retrieves a custom repository for the given entity.
   *
   * @template T - The type of the entity.
   * @param {EntityTarget<T>} entity - The entity target (class or string).
   * @returns {CustomRepository<T>} The extended custom repository for the entity.
   */
  getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): CustomRepository<T> {
    const repository = new CustomRepository<T>(entity, this.manager);
    repository.request = this.request;
    return repository;
  }

  /**
   * Retrieves the column names of the first result from a custom SQL query.
   *
   * @template T - The type of the entity.
   * @param {string} query - The SQL query to execute.
   * @param {(string | number)[]} queryParams - The parameters for the query.
   * @returns {Promise<string[]>} A promise that resolves to an array of column names.
   */
  async getColumns<T extends ObjectLiteral>(
    query: string,
    queryParams: (string | number)[],
  ): Promise<string[]> {
    const result: T[] = await this.query(query, queryParams);
    return Object.keys(result[0] || []);
  }

  /**
   * Retrieves the total number of documents (rows) that match a given query.
   *
   * @param {string} query - The SQL query to count the documents.
   * @param {(string | number)[]} queryValues - The parameters for the query.
   * @returns {Promise<number>} A promise that resolves to the total number of documents.
   */
  async getTotalDocs(
    query: string,
    queryValues: (string | number)[],
  ): Promise<number> {
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countQuery`;
    const result = await this.query(countQuery, queryValues);
    return parseInt(result[0].total, 10);
  }

  /**
   * Retrieves the column names for a given entity's table.
   *
   * @template T - The type of the entity.
   * @param {EntityTarget<T>} entity - The entity target (class or string).
   * @returns {Promise<string[]>} A promise that resolves to an array of column names.
   * @throws {BadRequestException} If an error occurs while retrieving the columns.
   */
  async getColumnsQuery<T>(entity: EntityTarget<T>): Promise<string[]> {
    try {
      const repository = this.getRepository(entity);
      const metadata: EntityMetadata = repository.metadata;
      const columns: string[] = metadata.columns.map((col) => col.propertyName);
      return columns;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Executes a custom SQL query with optional parameters and returns the result.
   *
   * @template T - The type of the entities being queried.
   * @param {string} query - The SQL query to execute.
   * @param {(string | number)[]} [params] - Optional parameters for the query.
   * @returns {Promise<T[]>} A promise that resolves to an array of results.
   * @throws {BadRequestException} If an error occurs during query execution.
   */
  async executeQuery<T extends ObjectLiteral>(
    query: string,
    params?: (string | number)[],
  ): Promise<T[]> {
    try {
      const response = await this.query<T[]>(query, params);
      return response;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

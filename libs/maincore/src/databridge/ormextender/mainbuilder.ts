import {
  DataSource,
  EntityManager,
  EntityMetadata,
  EntityTarget,
  ObjectLiteral,
} from 'typeorm';
import { CustomRepository } from './customrepository';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import {
  customquerypaginateprops,
  PaginationResults,
} from '@core/maincore/coretoolkit/types/coretypes';

/**
 * MainDBBuilder class extends the TypeORM DataSource to provide custom repository functionality
 * and various utility methods for database operations.
 */
export class MainDBBuilder {
  /**
   * The request object associated with the current context.
   * @protected
   * @type {Request}
   */
  protected request: Request = undefined;

  public manager: EntityManager;

  public dataSource: DataSource;

  /**
   * Initializes the MainDBBuilder with the given data source options.
   */
  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.manager = dataSource.manager;
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
    const repository = new CustomRepository<T>(entity, this.dataSource.manager);
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
    const result: T[] = await this.dataSource.query(query, queryParams);
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
    const result = await this.dataSource.query(countQuery, queryValues);
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
      const response = await this.dataSource.query<T[]>(query, params);
      return response;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private getMainTable(query: string) {
    const regex = /FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/i;
    const match = query.match(regex);
    if (match) {
      return match[1];
    }
    return null;
  }

  /**
   * Executes a custom SQL query with pagination, sorting, filtering, and global search.
   *
   * @template T - The type of the entities being queried.
   * @param {customquerypaginateprops<T>} data - The parameters for pagination, filtering, sorting, and the query itself.
   * @returns {Promise<PaginationResults<T>>} A promise that resolves to the paginated results.
   * @throws {BadRequestException} If an error occurs during query execution.
   */
  async customQueryPaginate<T extends ObjectLiteral>(
    data: customquerypaginateprops<T>,
  ): Promise<PaginationResults<T>> {
    try {
      const { query, queryParams, limit, page, sortBy, globalFilter, filters } =
        data;

      const mainTable = this.getMainTable(query);
      const countTotalDocs = this.getTotalDocs('SELECT *FROM ' + mainTable, []);

      let sql = query.trim();
      const queryValues = [...queryParams];
      if (sql.trim().endsWith(';')) {
        sql = sql.trim().slice(0, -1);
      }

      const whereClauses: string[] = [];
      const whereValues: string[] = [];

      const whereIndex = sql.toUpperCase().indexOf('WHERE');
      if (whereIndex !== -1) {
        const existingWhereClause = sql.substring(whereIndex + 5).trim();
        whereClauses.push(existingWhereClause);
      }

      if (globalFilter) {
        const columns = await this.getColumns(query, queryParams);
        const globalSearchClauses = columns
          .map((column) => `${column} LIKE ?`)
          .join(' OR ');

        whereClauses.push(`${globalSearchClauses}`);
        whereValues.push(...Array(columns.length).fill(`%${globalFilter}%`));
      }

      if (filters.length > 0) {
        filters.forEach((filter) => {
          whereClauses.push(`${String(filter.id)} LIKE ?`);
          whereValues.push(`%${filter.value}%`);
        });
      }

      // Reconstruct the SQL query with WHERE clauses
      if (whereClauses.length > 0) {
        const whereClause = whereClauses.join(' AND ');
        if (whereIndex !== -1) {
          sql = `${sql.substring(0, whereIndex)} WHERE ${whereClause}`;
        } else {
          sql += ` WHERE ${whereClause}`;
        }
        queryValues.push(...whereValues);
      }

      // apply sorting
      if (sortBy.length > 0) {
        const sortClauses = sortBy.map(
          (sort) => `${String(sort.id)} ${sort.desc ? 'DESC' : 'ASC'}`,
        );
        sql += ` ORDER BY ${sortClauses.join(', ')}`;
      }

      // Apply pagination
      sql += ` LIMIT ? OFFSET ?`;
      queryValues.push(limit, (page - 1) * limit);

      const [docs, totalDocs] = await Promise.all([
        this.dataSource.query(sql, queryValues),
        countTotalDocs,
      ]);
      const totalPages = Math.ceil(totalDocs / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      return {
        docs,
        totalDocs,
        totalPages,
        page: page,
        hasNextPage,
        hasPrevPage,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public setRequest(request: Request) {
    this.request = request;
  }
  public async __viewCustomPaginateData<R extends ObjectLiteral>(
    paginateprops: customquerypaginateprops<R>,
  ): Promise<PaginationResults<R>> {
    try {
      const data = await this.customQueryPaginate(paginateprops);
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

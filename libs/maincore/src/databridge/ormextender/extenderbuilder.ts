import { DataSourceOptions, ObjectLiteral } from 'typeorm';
import { MainDBBuilder } from './mainbuilder';
import { BadRequestException } from '@nestjs/common';
import {
  customquerypaginateprops,
  PaginationResults,
} from '../../coretoolkit/types/coretypes';

export class DataExtenderBuilder extends MainDBBuilder {
  constructor(options: DataSourceOptions) {
    super(options);
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
        this.query(sql, queryValues),
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
}

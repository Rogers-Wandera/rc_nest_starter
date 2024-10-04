import { format } from 'date-fns';
import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  QueryRunner,
  UpdateResult,
} from 'typeorm';
import { DataUtility } from './datautility';
import { Request } from 'express';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { MyRepository, validateWhereOptions } from './repository';
import { QueryDeepPartial } from '../types/queryfix_orm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  paginateprops,
  PaginationResults,
} from '../../coretoolkit/types/coretypes';
import { isEqual } from 'lodash';

/**
 * Custom repository that extends the Main Repository from TypeORM with additional functionalities.
 * @template T - The entity type like 'User'.
 */

export class CustomRepository<T extends ObjectLiteral> extends MyRepository<T> {
  /**
   * The request object associated with the current context.
   * @protected
   * @type {Request}
   */
  public request: Request;

  /**
   * Creates an instance of CustomRepository.
   *
   * @param {EntityTarget<T>} target - The entity target class like 'User'.
   * @param {EntityManager} manager - The entity manager from TypeORM.
   * @param {QueryRunner} [queryRunner] - The query runner from TypeORM (optional).
   */
  constructor(
    target: EntityTarget<T>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
  ) {
    super(target, manager, queryRunner);
  }

  /**
   * Returns the columns of the entity.
   */
  async getEntityColumns() {
    try {
      const columns = this.metadata.columns.map((col) => col.propertyName);
      return columns;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Returns the total count of documents matching certain conditions.
   * @param {DeepPartial<T> | null} conditions - Conditions to look for when counting documents.
   * @returns {Promise<number>}  A promise that resolves to the count of matching documents.
   */
  async getEntityTotalDocs(conditions: DeepPartial<T> | null): Promise<number> {
    try {
      const builder = this.createQueryBuilder('countQuery');
      const keys = Object.keys(conditions || {});
      if (keys.length > 0) {
        keys.forEach((key) => {
          builder.andWhere(`countQuery.${key} = :${key}`, {
            [key]: conditions[key],
          });
        });
      }
      const result = await builder.getCount();
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds an entity by conditions, returning only specified fields.
   * @param {Partial<T>} conditions - Conditions to find the entity.
   * @param {string | string[]} [fields='*']  Fields to return. Can be a comma-separated string or an array of field names.
   * @returns {Promise<T | null>} - A promise that resolves to the found entity or null if not found.
   */
  async findSelective(
    conditions: Partial<T>,
    fields: string | string[] = '*',
  ): Promise<T | null> {
    try {
      const queryBuilder = this.createQueryBuilder('entity');
      if (Array.isArray(fields)) {
        queryBuilder.select(fields.map((field) => `entity.${field}`));
      } else if (fields !== '*') {
        queryBuilder.select(
          fields.split(',').map((field) => `entity.${field.trim()}`),
        );
      }
      // Add the WHERE condition for the ID
      Object.entries(conditions).forEach(([key, value]) => {
        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      });

      const result = await queryBuilder.getOne();
      return (result as T) || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds one entity by conditions and updates it with the provided data.
   * @param {FindOptionsWhere<T>} conditions - Conditions to find the entity.
   * @param {QueryDeepPartial<T>} data - Data to update the entity with.
   */
  FindOneAndUpdate = async (
    conditions: FindOptionsWhere<T>,
    data: QueryDeepPartial<T>,
  ) => {
    try {
      const exists = await this.findOneBy(conditions);
      if (!exists) {
        throw new Error(`No ${this.metadata.tableName} found`);
      }
      if (!this.checkHasChanged(data, exists)) {
        return true;
      }
      if (this.request.user) {
        (data as Record<string, any>)['updatedBy'] = this.request.user.id;
        (data as Record<string, any>)['updateDate'] = format(
          new Date(),
          'yyyy-MM-dd HH:mm:ss',
        );
      }
      const newdata = { ...exists, ...data };
      const response = await this.save(newdata);
      if (response) {
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  private checkHasChanged(data: QueryDeepPartial<T>, exists: ObjectLiteral) {
    let hasChanged = false;
    for (const key in data) {
      if (
        data.hasOwnProperty(key) &&
        !isEqual(
          (exists as Record<string, any>)[key],
          (data as Record<string, any>)[key],
        )
      ) {
        hasChanged = true;
        break; // If one change is detected, we can stop further checks
      }
    }
    return hasChanged;
  }

  /**
   * Soft deletes an entity by criteria.
   * @param {FindOptionsWhere<T>} criteria  Criteria to find the entity to soft delete.
   * @returns {Promise<UpdateResult>}  A promise that resolves to the update result.
   */

  softDataDelete = async (
    criteria: FindOptionsWhere<T>,
  ): Promise<UpdateResult> => {
    try {
      if (!this.request.user) {
        throw new UnauthorizedException('No user found at soft delete');
      }
      const datautility = new DataUtility(this.manager);
      const exists: T | undefined = await this.findOne({ where: criteria });
      if (!exists) {
        throw new Error(`No ${this.metadata.tableName} found`);
      }
      const id: string = (exists as unknown as ObjectLiteral).id;
      const updateCriteria = {
        deletedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        isActive: 0,
        deletedBy: this.request.user.id,
      } as unknown as QueryDeepPartialEntity<T>;
      await datautility.saveRecycleBin(
        this.metadata.tableName,
        id,
        this.request.user.id,
      );
      const response = await this.update(criteria, updateCriteria);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Restores a soft-deleted entity by criteria.
   * @param {FindOptionsWhere<T>} criteria  Criteria to find the entity to restore.
   * @param {QueryDeepPartial<T>} [data] Optional data to update the entity with upon restoration.
   * @returns {Promise<UpdateResult>} A promise that resolves to the update result.
   */
  async restoreDelete(
    criteria: FindOptionsWhere<T>,
    data?: QueryDeepPartial<T>,
  ): Promise<UpdateResult> {
    try {
      await validateWhereOptions(criteria);
      const datautility = new DataUtility(this.manager);
      const exists = await this.createQueryBuilder()
        .withDeleted()
        .andWhere(criteria)
        .getOne();
      if (!exists) {
        throw new Error(`No ${this.metadata.tableName} found`);
      }
      let updateCriteria: QueryDeepPartialEntity<ObjectLiteral> = {
        deletedAt: null,
        isActive: 1,
        deletedBy: null,
      };
      if (data) {
        updateCriteria = { ...data, ...updateCriteria };
      }
      const response = await this.update(criteria, updateCriteria);
      await datautility.restoreDelete(
        this.metadata.tableName,
        (exists as unknown as ObjectLiteral).id,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds entities by conditions, including soft-deleted entities.
   * @param {FindOptionsWhere<T>} conditions Conditions to find the entities.
   */
  async findByConditions(conditions: FindOptionsWhere<T>) {
    try {
      await validateWhereOptions(conditions);
      const relations = this.metadata.relations.map((rel) => rel.propertyName);
      const queryBuilder = this.createQueryBuilder('entity');
      if (relations.length > 0) {
        relations.forEach((relation) => {
          queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
        });
      }
      const data = await queryBuilder
        .withDeleted()
        .andWhere(conditions)
        .getMany();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds one entity by conditions, including soft-deleted entities.
   * @param {FindOptionsWhere<T>} conditions Conditions to find the entity.
   */
  async findOneByConditions(conditions: FindOptionsWhere<T>) {
    try {
      await validateWhereOptions(conditions);
      const data = await this.createQueryBuilder('entity')
        .withDeleted()
        .andWhere(conditions)
        .getOne();
      return data;
    } catch (error) {
      throw error;
    }
  }
  async findOneWithValue(field: string, value: string, args: Partial<T>) {
    try {
      const query = this.createQueryBuilder('entity').andWhere(
        `entity.${field} = :value`,
        { value },
      );
      for (const key in args) {
        if (args[key]) {
          query.andWhere(`entity.${key} = :${key}`, { [key]: args[key] });
        }
      }
      const data = await query.getOne();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async InsertMany(data: T[]) {
    try {
      const response = await this.save(data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async countField(
    field: keyof T,
    conditions?: FindOneOptions<T>,
  ): Promise<number | null> {
    try {
      const query = this.createQueryBuilder('entity').select(
        `MAX(entity.${String(field)})`,
        'maxValue',
      );
      if (conditions) {
        query.where(conditions.where);
      }
      const result: { maxValue: number | null } = await query
        .withDeleted()
        .getRawOne();
      return result?.maxValue;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves paginated results based on the provided parameters.
   * @param {FindOptionsWhere<T>} paginate - The pagination options.
   */
  async Paginate(paginate: paginateprops<T>): Promise<PaginationResults<T>> {
    try {
      if (Object.keys(paginate).length <= 0) {
        throw new BadRequestException('Pagination should be provided');
      }
      const page = paginate.page > 0 ? paginate.page : 1;
      const relations = this.metadata.relations.map((rel) => rel.propertyName);
      const queryBuilder = this.createQueryBuilder('entity');
      if (relations && relations.length > 0) {
        relations.forEach((relation) => {
          queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
        });
      }
      if (paginate?.conditions) {
        Object.entries(paginate.conditions).forEach(([key, value]) => {
          if (relations.includes(key)) {
            const relationconditions = paginate.conditions[key];
            Object.entries(relationconditions).forEach(([key2, value2]) => {
              queryBuilder.andWhere(`${key}.${key2} = :${key2}`, {
                [key2]: value2,
              });
            });
          } else {
            queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
          }
        });
      }

      //   global filter
      if (paginate?.globalFilter) {
        const columns = this.metadata.columns.map((col) => col.propertyName);
        const globalFilterConditions = columns
          .map((column) => `entity.${column} LIKE :globalFilter`)
          .join(' OR ');
        queryBuilder.andWhere(`(${globalFilterConditions})`, {
          globalFilter: `%${paginate.globalFilter}%`,
        });
      }

      //   filters
      if (paginate.filters && paginate.filters?.length > 0) {
        paginate.filters.forEach((filter) => {
          const value = filter.id.toString().toLowerCase().includes('date')
            ? `%${format(new Date(filter.value), 'yyyy-MM-dd')}%`
            : `%${filter.value}%`;
          queryBuilder.andWhere(
            `entity.${filter.id.toString()} LIKE :${filter.id.toString()}`,
            { [filter.id]: value },
          );
        });
      }

      //   add sorting
      if (paginate?.sortBy && paginate?.sortBy.length > 0) {
        const sort = paginate.sortBy[0].id;
        const sortOrder = paginate.sortBy[0].desc ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`entity.${String(sort)}`, sortOrder);
      }

      //   add pagination
      queryBuilder.skip((page - 1) * paginate.limit).take(paginate.limit);
      const [docs, totalDocs] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(totalDocs / paginate.limit);
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
      throw new BadRequestException(error);
    }
  }
}

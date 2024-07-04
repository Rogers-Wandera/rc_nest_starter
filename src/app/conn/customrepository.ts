import { format } from 'date-fns';
import {
  EntityManager,
  EntityTarget,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  QueryRunner,
  UpdateResult,
} from 'typeorm';
import { DataUtility } from './datautility';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { MyRepository, validateWhereOptions } from './repository';

export class CustomRepository<T> extends MyRepository<T> {
  public request: Request;
  constructor(
    target: EntityTarget<T>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
  ) {
    super(target, manager, queryRunner);
  }
  async getEntityColumns() {
    try {
      const columns = this.metadata.columns.map((col) => col.propertyName);
      return columns;
    } catch (error) {
      throw error;
    }
  }

  async getEntityTotalDocs(conditions: Partial<T> | null): Promise<number> {
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
  async findSelective(
    id: Partial<T>,
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
      Object.entries(id).forEach(([key, value]) => {
        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      });

      const result = await queryBuilder.getOne();
      return (result as T) || null;
    } catch (error) {
      throw error;
    }
  }

  FindOneAndUpdate = async (
    conditions: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ) => {
    try {
      const exists = await this.findOneBy(conditions);
      if (!exists) {
        throw new Error(`No ${this.metadata.tableName} found`);
      }
      if (this.request.user) {
        data['updatedBy'] = this.request.user.id;
        data['updateDate'] = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      }
      const response = await this.update(conditions, data);
      if (response) {
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

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
      const updateCriteria: QueryDeepPartialEntity<ObjectLiteral> = {
        deletedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        isActive: 0,
        deletedBy: this.request.user.id,
      };
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

  async restoreDelete(
    criteria: FindOptionsWhere<T>,
    data?: QueryDeepPartialEntity<T>,
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

  async findByConditions(conditions: FindOptionsWhere<T>) {
    try {
      await validateWhereOptions(conditions);
      const data = await this.createQueryBuilder('entity')
        .withDeleted()
        .andWhere(conditions)
        .getMany();
      return data;
    } catch (error) {
      throw error;
    }
  }
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
}

export const repositoryextender = <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  manager: EntityManager,
  request: Request,
) => {
  const extender = new CustomRepository<T>(entity, manager);
  extender.request = request;
  return {
    getEntityTotalDocs: extender.getEntityTotalDocs,
    getEntityColumns: extender.getEntityColumns,
    findSelective: extender.findSelective,
    FindOneAndUpdate: extender.FindOneAndUpdate,
    softDataDelete: extender.softDataDelete,
    restoreDelete: extender.restoreDelete,
    findByConditions: extender.findByConditions,
    findOneWithValue: extender.findOneWithValue,
    findOneByConditions: extender.findOneByConditions,
    InsertMany: extender.InsertMany,
    countField: extender.countField,
  };
};

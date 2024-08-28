import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { EntityTarget } from 'typeorm';
import { Paramstype } from '../types/coretypes';
import { BaseEntityClass } from '../../entities/base.entity';

export const VALIDATE_SERVICE = 'VALIDATE_SERVICE';

/**
 * The `servicevalidate` type defines the structure for the service validation configuration,
 * specifying the entity to be validated, optional key, type, field, and name.
 *
 * @template T
 * @property {EntityTarget<T>} entity - The TypeORM entity that will be validated.
 * @property {string} [key] - An optional key to identify the specific validation.
 * @property {Paramstype} [type] - The type of parameters to be validated (e.g., body, query, params).
 * @property {string} [field] - The specific field of the entity to validate.
 * @property {string} [name] - An optional name for the validation configuration.
 */
export type servicevalidate<
  T extends BaseEntityClass<R>,
  R extends number | string = number,
> = {
  entity: EntityTarget<T> | ((context: ExecutionContext) => EntityTarget<T>);
  key?: string | ((context: ExecutionContext) => string);
  type?: Paramstype;
  field?: string;
  name?: string;
};

/**
 * A decorator that attaches service validation metadata to a route handler.
 * This metadata can be used to validate entities or fields against the provided configuration.
 *
 * @param {servicevalidate<unknown>[]} data - An array of service validation configurations.
 */
export const ValidateService = (
  data: servicevalidate<BaseEntityClass>[] | servicevalidate<BaseEntityClass>,
) => SetMetadata(VALIDATE_SERVICE, data);

import { SetMetadata } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { Paramstype } from '../types/coretypes';

export const SCHEMA_KEY = 'SCHEMA_KEY';

/**
 * The `schema_validate` type defines the structure for the validation schema
 * and the type of parameters that will be validated.
 *This will trigger the associated interceptor for validating the schemas passed
 * @property {ObjectSchema[]} schemas - An array of Joi schemas to validate the data against.
 * @property {Paramstype} [type] - The type of parameters to be validated (e.g., body, query, params).
 */
export type schema_validate = {
  schemas: ObjectSchema[];
  type?: Paramstype;
};

/**
 * A decorator that attaches validation schemas to a route handler.
 * This metadata can later be used to validate incoming requests using the provided Joi schemas.
 * @param {schema_validate} validate - The validation configuration containing schemas and an optional type.
 */
export const Schemas = (validate: schema_validate) =>
  SetMetadata(SCHEMA_KEY, validate);

import { SetMetadata } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { Paramstype } from '../app.types';

export const SCHEMA_KEY = 'SCHEMA_KEY';
export type schema_validate = {
  schemas: ObjectSchema[];
  type?: Paramstype;
};
export const Schemas = (validate: schema_validate) =>
  SetMetadata(SCHEMA_KEY, validate);

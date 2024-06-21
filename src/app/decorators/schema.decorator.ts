import { Paramtype, SetMetadata } from '@nestjs/common';
import { ObjectSchema } from 'joi';

export const SCHEMA_KEY = 'SCHEMA_KEY';
export type schema_validate = {
  schemas: ObjectSchema[];
  type: Paramtype;
};
export const Schemas = (validate: schema_validate) =>
  SetMetadata(SCHEMA_KEY, validate);

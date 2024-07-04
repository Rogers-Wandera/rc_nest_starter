import { SetMetadata } from '@nestjs/common';
import { EntityTarget } from 'typeorm';
import { Paramstype } from '../app.types';

export const VALIDATE_SERVICE = 'VALIDATE_SERVICE';
export type servicevalidate<T> = {
  entity: EntityTarget<T>;
  key?: string;
  type?: Paramstype;
  field?: string;
  name?: string;
};
export const ValidateService = (data: servicevalidate<unknown>[]) =>
  SetMetadata(VALIDATE_SERVICE, data);

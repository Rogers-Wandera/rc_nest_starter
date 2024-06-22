import { SetMetadata } from '@nestjs/common';
import { Paramstype } from '../app.types';

export const DECRYPT_KEY = 'DECRYPT_KEY';
export type decrypttype = {
  type: Paramstype;
  keys: string[];
  decrypttype?: 'uri' | 'other';
};
export const Decrypt = (options: decrypttype) =>
  SetMetadata(DECRYPT_KEY, options);

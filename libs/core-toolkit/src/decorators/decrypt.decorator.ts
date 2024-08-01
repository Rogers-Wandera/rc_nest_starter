import { SetMetadata } from '@nestjs/common';
import { decrypttype } from '../types/coretypes';

export const DECRYPT_KEY = 'DECRYPT_KEY';
export const Decrypt = (options: decrypttype) =>
  SetMetadata(DECRYPT_KEY, options);

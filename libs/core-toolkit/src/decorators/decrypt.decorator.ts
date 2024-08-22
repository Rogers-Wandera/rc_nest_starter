import { SetMetadata } from '@nestjs/common';
import { decrypttype } from '../types/coretypes';

export const DECRYPT_KEY = 'DECRYPT_KEY';

/**
 * Decorator to set metadata for decryption operations.
 * This metadata is used to configure how data should be decrypted in NestJS.
 *
 * @param options - Configuration options for decryption, conforming to the `decrypttype` interface.
 *
 * @example
 * ```typescript
 * @Decrypt({
 *   algorithm: 'aes-256-cbc',
 *   key: 'my-secret-key',
 *   iv: 'initialization-vector',
 * })
 * export class SomeClass {}
 * ```
 *
 * @see {@link decrypttype} for the structure of options.
 */
export const Decrypt = (options: decrypttype) =>
  SetMetadata(DECRYPT_KEY, options);

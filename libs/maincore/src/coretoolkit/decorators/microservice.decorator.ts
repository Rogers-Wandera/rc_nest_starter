import { SetMetadata } from '@nestjs/common';

export const MICRO_SERVICE_KEY = 'MICRO_SERVICE_KEY';

/**
 * Decorator to mark a method or class for microservice checks.
 * It sets metadata with a key of `MICRO_SERVICE_KEY` and a value of `'check'`.
 * This can be used to identify or filter operations that should undergo a microservice-related check.
 *
 * @example
 * ```typescript
 * @CheckMicroService()
 * export class SomeClass {}
 * ```
 */
export const CheckMicroService = () => SetMetadata(MICRO_SERVICE_KEY, 'check');

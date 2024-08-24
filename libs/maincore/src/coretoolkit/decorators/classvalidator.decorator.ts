import { SetMetadata } from '@nestjs/common';
import { ClassValidatorType } from '../types/coretypes';

export const CLASS_VALIDATOR_KEY = 'CLASS_VALIDATOR_KEY';

/**
 * Decorator to set metadata for class validation using class-validator.
 * This metadata is used to configure validation rules for classes in NestJS.
 *
 * @param options - Configuration options for the class-validator.
 * This parameter should adhere to the `ClassValidatorType` interface.
 *
 * @example
 * ```typescript
 * @ClassValidator({
 *   someOption: 'value',
 *   anotherOption: true,
 * })
 * export class SomeClass {}
 * ```
 *
 * @see {@link ClassValidatorType} for the structure of options.
 */
export const ClassValidator = (options: ClassValidatorType) =>
  SetMetadata(CLASS_VALIDATOR_KEY, options);

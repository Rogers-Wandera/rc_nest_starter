import { SetMetadata } from '@nestjs/common';
import { ClassValidatorType } from '../types/coretypes';

export const CLASS_VALIDATOR_KEY = 'CLASS_VALIDATOR_KEY';
export const ClassValidator = (options: ClassValidatorType) =>
  SetMetadata(CLASS_VALIDATOR_KEY, options);

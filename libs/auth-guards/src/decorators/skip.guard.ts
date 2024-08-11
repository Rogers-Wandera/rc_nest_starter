import { SetMetadata } from '@nestjs/common';
import { GUARDS } from '@toolkit/core-toolkit/types/enums/enums';

export const SKIP_GUARD_KEY = 'SKIP_GUARD_KEY';
export const SkipGuards = (...skips: GUARDS[]) =>
  SetMetadata(SKIP_GUARD_KEY, skips);

import { SetMetadata } from '@nestjs/common';
import { GUARDS } from '../../coretoolkit/types/enums/enums';

/**
 * Key used to store the skip guards metadata in the request.
 */
export const SKIP_GUARD_KEY = 'SKIP_GUARD_KEY';

/**
 * A custom decorator to set metadata indicating which guards should be skipped
 * for the decorated handler or class.
 *
 * @param {...GUARDS[]} skips - The guards that should be skipped for the decorated handler or class.
 * @see {@link GUARDS}
 */
export const SkipGuards = (...skips: GUARDS[]) =>
  SetMetadata(SKIP_GUARD_KEY, skips);

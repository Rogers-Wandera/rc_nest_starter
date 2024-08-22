import { SetMetadata } from '@nestjs/common';

export const PAGINATE_KEY = 'paginate';

/**
 * Decorator to mark a method or class for pagination processing.
 * It sets metadata with a key of `PAGINATE_KEY` and a value of `'paginate'`.
 * This is used to trigger or handle pagination logic in a method or controller.
 *
 * @example
 * ```typescript
 * @Paginate()
 * export class SomeClass {
 *   // Method or controller logic that handles pagination
 * }
 * ```
 */
export const Paginate = () => SetMetadata(PAGINATE_KEY, 'paginate');

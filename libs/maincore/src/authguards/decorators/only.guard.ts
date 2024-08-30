import { SetMetadata } from '@nestjs/common';
import { ROLE } from '../../coretoolkit/types/enums/enums';

/**
 * Key used to store roles metadata in the request.
 */
export const ONLY_GUARD = 'ONLY_GUARD';

/**
 * A custom decorator to set roles metadata on a handler or class.
 * This metadata is used to define which roles are allowed to access
 * the decorated route or class.
 * As a security precaution it adds additional security to a route, to enforce only the authorized roles
 * it will skip even the permissions for even if a person has one, but if no roles, they wont be able to access.
 * @param {...ROLE[]} roles - The roles that are allowed to access the decorated handler or class.
 * @see {@link ROLE}
 */
export const Only = (...roles: ROLE[]) => SetMetadata(ONLY_GUARD, roles);

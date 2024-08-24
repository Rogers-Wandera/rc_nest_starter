import { SetMetadata } from '@nestjs/common';
import { ROLE } from '../../coretoolkit/types/enums/enums';

/**
 * Key used to store roles metadata in the request.
 */
export const ROLES_KEY = 'roles';

/**
 * A custom decorator to set roles metadata on a handler or class.
 * This metadata is used to define which roles are allowed to access
 * the decorated route or class.
 *
 * @param {...ROLE[]} roles - The roles that are allowed to access the decorated handler or class.
 * @see {@link ROLE}
 */
export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES_KEY, roles);

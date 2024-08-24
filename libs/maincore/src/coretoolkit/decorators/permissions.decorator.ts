import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'PERMISSION_KEY';

/**
 * Defines the structure of the permission data used in the `Permissions` decorator.
 *
 * @property {string} module - The name of the module for which the permission is granted.
 * @property {string} moduleLink - The link or identifier associated with the module.
 * @property {string} [name] - An optional name describing the specific permission.
 */
export type permissiontype = {
  module: string;
  moduleLink: string;
  name?: string;
};

/**
 * Custom decorator to specify permissions required for accessing a particular route or handler.
 * It sets metadata with the `PERMISSION_KEY` key and the provided permission data.
 * This will generate the module and its associated links in the controller setting
 * all routes and permissions for that particular module link
 *
 * @returns {void} Sets the permission metadata on the route or handler.
 *
 * @example
 * ```typescript
 * @Permissions({ module: 'User', moduleLink: '/user', name: 'User' })
 * @Post('create')
 * createUser() {
 *   // Handler logic
 * }
 * ```
 * @see {@link permissiontype}
 */
export const Permissions = (data: permissiontype) =>
  SetMetadata(PERMISSION_KEY, data);

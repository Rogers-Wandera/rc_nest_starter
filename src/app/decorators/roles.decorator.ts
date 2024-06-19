import { SetMetadata } from '@nestjs/common';

export type rolestype = 'ADMIN' | 'USER' | 'PROGRAMMER' | 'EDITOR';
export type SYSTEM_ROLES = {
  [k in rolestype]: number;
};
export enum Role {
  ADMIN = 5150,
  USER = 2001,
  PROGRAMMER = 1982,
  EDITOR = 1845,
}
export const ROLES_KEY = 'roles';
// export const Roles = Reflector.createDecorator<rolestype[]>();
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

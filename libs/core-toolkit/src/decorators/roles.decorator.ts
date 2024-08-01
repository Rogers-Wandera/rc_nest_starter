import { SetMetadata } from '@nestjs/common';
import { rolestype } from '../types/coretypes';

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
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

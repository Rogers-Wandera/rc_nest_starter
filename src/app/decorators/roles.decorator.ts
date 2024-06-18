import { Reflector } from '@nestjs/core';

export type rolestype = 'ADMIN' | 'USER' | 'PROGRAMMER' | 'EDITOR';
export type SYSTEM_ROLES = {
  [k in rolestype]: number;
};
export const Roles = Reflector.createDecorator<rolestype[]>();

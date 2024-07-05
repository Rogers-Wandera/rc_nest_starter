import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'PERMISSION_KEY';
export type permissiontype = {
  module: string;
  moduleLink: string;
  name?: string;
};
export const Permissions = (data: permissiontype) =>
  SetMetadata(PERMISSION_KEY, data);

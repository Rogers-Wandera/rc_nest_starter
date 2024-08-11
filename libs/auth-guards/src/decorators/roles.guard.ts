import { SetMetadata } from '@nestjs/common';
import { ROLE } from '@toolkit/core-toolkit/types/enums/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES_KEY, roles);

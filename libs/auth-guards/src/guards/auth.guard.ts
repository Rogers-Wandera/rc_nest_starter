import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';
import { EMailGuard } from './email.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from '../decorators/roles.guard';
import { GUARDS, ROLE } from '@toolkit/core-toolkit/types/enums/enums';
import { SkipGuards } from '../decorators/skip.guard';

export function AuthGuard(...roles: ROLE[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtGuard, EMailGuard, RolesGuard),
  );
}

export function SkipAllGuards() {
  return applyDecorators(
    SkipGuards(GUARDS.EMAIL, GUARDS.JWT, GUARDS.REFRESH, GUARDS.ROLES),
  );
}

import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';
import { EMailGuard } from './email.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from '../decorators/roles.guard';
import { GUARDS, ROLE } from '../../coretoolkit/types/enums/enums';
import { SkipGuards } from '../decorators/skip.guard';
import { OnlyGuard } from './only.guard';

/**
 * A custom decorator that applies authentication and authorization guards to a handler or class.
 *
 * This decorator sets roles metadata using the `Roles` decorator and applies multiple guards:
 * - `JwtGuard`: A guard to handle JWT-based authentication.
 * - `EMailGuard`: A guard to handle email-based authentication.
 * - `RolesGuard`: A guard to check if the user has the required roles.
 *
 * @param {...ROLE[]} roles - The roles that are required for accessing the decorated handler or class.
 */
export function AuthGuard(...roles: ROLE[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtGuard, EMailGuard, RolesGuard, OnlyGuard),
  );
}

/**
 * A custom decorator that skips all specified guards for a handler or class.
 *
 * This decorator sets metadata to indicate that the following guards should be skipped:
 * - `GUARDS.EMAIL`
 * - `GUARDS.JWT`
 * - `GUARDS.REFRESH`
 * - `GUARDS.ROLES`
 */
export function SkipAllGuards() {
  return applyDecorators(
    SkipGuards(GUARDS.EMAIL, GUARDS.JWT, GUARDS.REFRESH, GUARDS.ROLES),
  );
}

import { ROLE } from '@core/maincore/coretoolkit/types/enums/enums';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ONLY_GUARD } from '../decorators/only.guard';
import { Request } from 'express';
import { SystemDefaultRoles } from '@core/maincore/coreservices/services/defaults/roles/roles.service';
import { SYSTEM_ROLES } from '@core/maincore/coretoolkit/types/coretypes';

/**
 * A guard that checks if the request is authorized based on the only guard roles.
 * Implements the `CanActivate` interface to determine if a route can be activated based on the roles of the user.
 * @see {@link OnlyGuard}
 */
@Injectable()
export class OnlyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private systemroles: SystemDefaultRoles,
  ) {}

  async canActivate(context: ExecutionContext) {
    const onlyroles = this.reflector.getAllAndOverride<ROLE[]>(ONLY_GUARD, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!onlyroles) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;
    const userroles = user.roles;
    if (!userroles) {
      throw new UnauthorizedException(
        'This is a protected route, contact admin',
      );
    }
    const systemroles = await this.systemroles.getRoles();
    if (Object.keys(systemroles).length <= 0) {
      throw new UnauthorizedException('No roles specified, contact admin');
    }
    const results = this.matchRoles(context, systemroles, onlyroles);
    if (!results) {
      throw new UnauthorizedException(
        "This is only protected route. You don't have the neccessary roles to view this route",
      );
    }
    return true;
  }
  /**
   * Matches user roles with the required roles for the route.
   * @param {ExecutionContext} context - The execution context containing request and metadata.
   * @param {SYSTEM_ROLES} systemroles - The system roles.
   * @param {ROLE[]} roles - The required roles for the route.
   * @throws {UnauthorizedException} - If the user is not authorized to view the route.
   */
  matchRoles(
    context: ExecutionContext,
    systemroles: SYSTEM_ROLES,
    roles: ROLE[],
  ) {
    const request: Request = context.switchToHttp().getRequest();
    const userroles = request.user.roles;
    const actualroles = roles.map((role) => {
      return Object.values(systemroles).find((val) => val === role);
    });
    if (actualroles.length <= 0) {
      throw new UnauthorizedException(
        'You are not authorized to view this route',
      );
    }
    const results = userroles.map((role) => actualroles.includes(role));
    const checkResults = results.find((val) => val === true);
    return checkResults;
  }
}

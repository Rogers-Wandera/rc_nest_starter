import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SystemDefaultRoles } from '@services/core-services/services/defaults/roles/roles.service';
import { EnvConfig } from '@toolkit/core-toolkit/config/config';
import { logEvent } from '@toolkit/core-toolkit/middlewares/logger.middleware';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.guard';
import { SYSTEM_ROLES } from '@toolkit/core-toolkit/types/coretypes';
import { GUARDS, ROLE } from '@toolkit/core-toolkit/types/enums/enums';
import { SKIP_GUARD_KEY } from '../decorators/skip.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private systemroles: SystemDefaultRoles,
    private configservice: ConfigService<EnvConfig>,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const skiprole = this.reflector.getAllAndOverride<GUARDS[]>(
      SKIP_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skiprole && skiprole.includes(GUARDS.ROLES)) {
      return true;
    }
    if (!roles) {
      throw new UnauthorizedException(
        'This is a protected route, contact admin',
      );
    }
    const request: Request = context.switchToHttp().getRequest();
    const userroles = request.user.roles;
    if (!userroles) {
      throw new UnauthorizedException(
        'This is a protected route, contact admin',
      );
    }
    const systemroles = await this.systemroles.getRoles();
    if (Object.keys(systemroles).length <= 0) {
      throw new UnauthorizedException(
        'Please no roles specified contact admin',
      );
    }
    const response = await this.matchRoles(context, systemroles, roles);
    const checkserverrole = this.MatchServerRoles(context);
    await this.LogAccessEvent(request);
    if (response || checkserverrole) {
      return true;
    }
    throw new UnauthorizedException('Your not authorized to view this route');
  }

  async matchRoles(
    context: ExecutionContext,
    systemroles: SYSTEM_ROLES,
    roles: ROLE[],
  ): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const userroles = request.user.roles;
    const actualroles = roles.map((role) => {
      return Object.values(systemroles).find((val) => val === role);
    });
    if (actualroles.length <= 0) {
      throw new UnauthorizedException('Your not authorized to view this route');
    }
    const results = userroles.map((role) => actualroles.includes(role));
    const checkResults = results.find((val) => val === true);
    return checkResults;
  }

  MatchServerRoles(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const baseapi = this.configservice.get<string>('baseapi');
    const method = req.method;
    const urlpath = `${req.route.path}`;
    const userroles = req.user.serverroles;
    if (userroles.length > 0) {
      const exists = userroles.find((role) => {
        const fullroute = `${baseapi}${role.roleValue}`;
        return fullroute === urlpath && role.method === method;
      });
      if (!exists) {
        return false;
      }
      return true;
    }
    return false;
  }

  async LogAccessEvent(req: Request) {
    const urlpath = `${req.baseUrl}${req.route.path}`;
    const usercred = `Name: ${req.user.displayName}, Id: ${req.user.id} `;
    const accessroute = ` Method: ${req.method}, Route: ${urlpath}`;
    await logEvent(usercred + accessroute, 'accesslog.md');
  }
}

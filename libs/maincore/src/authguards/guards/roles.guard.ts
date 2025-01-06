import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SystemDefaultRoles } from '../../coreservices/services/defaults/roles/roles.service';
import { EnvConfig } from '../../coretoolkit/config/config';
import { logEvent } from '../../coretoolkit/middlewares/logger.middleware';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.guard';
import {
  reqUser,
  ServerRolesType,
  SYSTEM_ROLES,
} from '../../coretoolkit/types/coretypes';
import { GUARDS, ROLE } from '../../coretoolkit/types/enums/enums';
import { SKIP_GUARD_KEY } from '../decorators/skip.guard';
import { ServerRolesView } from '../../entities/coreviews/serverroute.view';
import { EntityDataSource } from '../../databridge/model/enity.data.model';

/**
 * A guard that checks if the request is authorized based on user roles.
 * Implements the `CanActivate` interface to determine if a route can be activated based on the roles of the user.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Creates an instance of RolesGuard.
   * @param {Reflector} reflector - Reflector to get metadata.
   * @param {SystemDefaultRoles} systemroles - Service to get system default roles.
   * @param {ConfigService<EnvConfig>} configservice - Service to get configuration values.
   */
  constructor(
    private reflector: Reflector,
    private systemroles: SystemDefaultRoles,
    private configservice: ConfigService<EnvConfig>,
    private source: EntityDataSource,
  ) {}

  /**
   * Determines if the current request is allowed to proceed based on user roles.
   * @param {ExecutionContext} context - The execution context containing request and metadata.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the route can be activated, `false` otherwise.
   * @throws {UnauthorizedException} - If user roles are not available, if system roles are not specified, or if the user is not authorized.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      throw new UnauthorizedException('No roles specified, contact admin');
    }
    const serverroles = await this.GetServerRoles(request.user);
    const response = await this.matchRoles(context, systemroles, roles);
    const checkserverrole = this.MatchServerRoles(context, serverroles);
    await this.LogAccessEvent(request);
    if (response || checkserverrole) {
      return true;
    }
    throw new UnauthorizedException(
      'You are not authorized to view this route',
    );
  }

  /**
   * Matches user roles with the required roles for the route.
   * @param {ExecutionContext} context - The execution context containing request and metadata.
   * @param {SYSTEM_ROLES} systemroles - The system roles.
   * @param {ROLE[]} roles - The required roles for the route.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the user roles match the required roles, `false` otherwise.
   * @throws {UnauthorizedException} - If the user is not authorized to view the route.
   */
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
      throw new UnauthorizedException(
        'You are not authorized to view this route',
      );
    }
    const results = userroles.map((role) => actualroles.includes(role));
    const checkResults = results.find((val) => val === true);
    return checkResults;
  }

  /**
   * Checks if the user's server roles match the route path and method.
   * @param {ExecutionContext} context - The execution context containing request and metadata.
   * @returns {boolean} - `true` if the server roles match the route path and method, `false` otherwise.
   */
  MatchServerRoles(
    context: ExecutionContext,
    serverroles: ServerRolesType[],
  ): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const baseapi = this.configservice.get<string>('baseapi');
    const method = req.method;
    const urlpath = `${req.route.path}`;
    if (serverroles.length > 0) {
      const exists = serverroles.find((role) => {
        const fullroute = `${baseapi}${role.roleValue}`;
        return fullroute === urlpath && role.method === method;
      });
      return exists ? true : false;
    }
    return false;
  }

  /**
   * Logs an access event including user information and the accessed route.
   * @param {Request} req - The request object containing user and route information.
   */
  async LogAccessEvent(req: Request): Promise<void> {
    const urlpath = `${req.baseUrl}${req.route.path}`;
    const usercred = `Name: ${req.user.displayName}, Id: ${req.user.id} `;
    const accessroute = `Method: ${req.method}, Route: ${urlpath}`;
    await logEvent(usercred + accessroute, 'accesslog');
  }

  private async GetServerRoles(user: reqUser): Promise<ServerRolesType[]> {
    const serveraccess = await this.source.getRepository(ServerRolesView).find({
      where: { userId: user.id, expired: 0, isActive: 1, srrActive: 1 },
    });
    if (serveraccess.length > 0) {
      const res: ServerRolesType[] = serveraccess.map((data) => {
        return {
          roleName: data.roleName,
          roleValue: data.roleValue,
          expired: data.expired,
          days_left: data.days_left,
          userId: data.userId,
          method: data.method,
        };
      });
      return res;
    }
    return [];
  }
}

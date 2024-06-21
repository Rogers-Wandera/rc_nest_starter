import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Injectable,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenUser } from '../users/users.types';

import { RefreshTokenService } from '../refreshtokens/refreshtokens.service';
import { UserService } from '../users/users.service';
import { Reflector } from '@nestjs/core';
import {
  ROLES_KEY,
  Role,
  SYSTEM_ROLES,
} from 'src/app/decorators/roles.decorator';
import { SystemDefaultRoles } from '../../defaults/roles/roles.service';
import { logEvent } from 'src/middlewares/logger.middleware';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const payload: TokenUser = await this.jwtService.verifyAsync(token);
      request.user = payload.user;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException(error.message);
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(RefreshTokenService)
    private refreshtoken: RefreshTokenService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = await this.refreshtoken.ViewSingleRefreshtoken(
      request.user.id,
    );
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      await this.jwtService.verifyAsync(token.token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token expired Log off and login again',
        );
      }
      throw new UnauthorizedException(error.message);
    }
    return true;
  }
}

@Injectable()
export class EMailGuard implements CanActivate {
  constructor(private readonly userservice: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException('Your not authorized to view this route');
    }
    const user = await this.userservice.FindOne({ id: request.user.id });
    if (!user) {
      throw new UnauthorizedException('Your not authorized to view this route');
    }
    if (user.verified === 0) {
      throw new UnauthorizedException(
        'Your not authorized, please verify your account or contact admin',
      );
    }
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private systemroles: SystemDefaultRoles,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
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
    await this.LogAccessEvent(request);
    return response;
  }

  async matchRoles(
    context: ExecutionContext,
    systemroles: SYSTEM_ROLES,
    roles: Role[],
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
    if (!checkResults) {
      throw new UnauthorizedException('Your not authorized to view this route');
    }
    return checkResults;
  }

  async LogAccessEvent(req: Request) {
    const urlpath = `${req.baseUrl}${req.route.path}`;
    const usercred = `Name: ${req.user.displayName}, Id: ${req.user.id} `;
    const accessroute = ` Method: ${req.method}, Route: ${urlpath}`;
    await logEvent(usercred + accessroute, 'accesslog.md');
  }
}

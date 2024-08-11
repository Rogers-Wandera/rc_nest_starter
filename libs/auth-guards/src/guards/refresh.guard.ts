import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '@services/core-services/services/auth/refreshtokens/refreshtokens.service';
import { GUARDS } from '@toolkit/core-toolkit/types/enums/enums';
import { Request } from 'express';
import { SKIP_GUARD_KEY } from '../decorators/skip.guard';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private refreshtoken: RefreshTokenService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = await this.refreshtoken.ViewSingleRefreshtoken(
      request.user.id,
    );
    const skiprole = this.reflector.getAllAndOverride<GUARDS[]>(
      SKIP_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skiprole && skiprole.includes(GUARDS.REFRESH)) {
      return true;
    }
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

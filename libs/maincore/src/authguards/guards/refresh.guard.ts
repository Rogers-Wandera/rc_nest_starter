import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../../coreservices/services/auth/refreshtokens/refreshtokens.service';
import { GUARDS } from '../../coretoolkit/types/enums/enums';
import { Request } from 'express';
import { SKIP_GUARD_KEY } from '../decorators/skip.guard';

/**
 * A guard that checks if the request is authorized based on the presence and validity of a refresh token.
 * Implements the `CanActivate` interface to determine if a route can be activated.
 */
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  /**
   * Creates an instance of RefreshTokenGuard.
   * @param {JwtService} jwtService - Service to handle JWT operations.
   * @param {RefreshTokenService} refreshtoken - Service to handle refresh token operations.
   * @param {Reflector} reflector - Reflector to get metadata.
   */
  constructor(
    private jwtService: JwtService,
    private refreshtoken: RefreshTokenService,
    private reflector: Reflector,
  ) {}

  /**
   * Determines if the current request is allowed to proceed based on the refresh token.
   * @param {ExecutionContext} context - The execution context containing request and metadata.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the route can be activated, `false` otherwise.
   * @throws {UnauthorizedException} - If no refresh token is provided, if the token is expired, or if there are issues with token verification.
   */
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
          'Token expired. Log off and log in again.',
        );
      }
      throw new UnauthorizedException(error.message);
    }
    return true;
  }
}

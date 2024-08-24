import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TokenUser } from '../../coretoolkit/types/coretypes';
import { GUARDS } from '../../coretoolkit/types/enums/enums';
import { Request } from 'express';
import { SKIP_GUARD_KEY } from '../decorators/skip.guard';

/**
 * A guard that checks if the request is authorized based on a JWT token.
 * Implements the `CanActivate` interface to determine if a route can be activated.
 */
@Injectable()
export class JwtGuard implements CanActivate {
  /**
   * Creates an instance of JwtGuard.
   * @param {JwtService} jwtService - Service to handle JWT operations.
   * @param {Reflector} reflector - Reflector to get metadata.
   */
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  /**
   * Determines if the current request is allowed to proceed based on the JWT token.
   * @param {ExecutionContext} context - The execution context containing request and metadata.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the route can be activated, `false` otherwise.
   * @throws {UnauthorizedException} - If no token is provided, if the token is expired, or if there are issues with token verification.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const skiprole = this.reflector.getAllAndOverride<GUARDS[]>(
      SKIP_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skiprole && skiprole.includes(GUARDS.JWT)) {
      return true;
    }
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

  /**
   * Extracts the JWT token from the `Authorization` header of the request.
   * @param {Request} request - The HTTP request object.
   * @returns {string | undefined} - The extracted token if present, otherwise `undefined`.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

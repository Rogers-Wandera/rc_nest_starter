import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../coreservices/services/auth/users/users.service';
import { GUARDS } from '../../coretoolkit/types/enums/enums';
import { Request } from 'express';
import { SKIP_GUARD_KEY } from '../decorators/skip.guard';

/**
 * A guard that checks if the user is authorized based on their email verification status.
 * Implements the `CanActivate` interface to determine if a route can be activated.
 */
@Injectable()
export class EMailGuard implements CanActivate {
  /**
   * Creates an instance of EMailGuard.
   * @param {UserService} userservice - Service to handle user-related operations.
   * @param {Reflector} reflector - Reflector to get metadata.
   */
  constructor(
    private readonly userservice: UserService,
    private reflector: Reflector,
  ) {}

  /**
   * Determines if the current request is allowed to proceed based on the email verification status.
   * @param {ExecutionContext} context - The execution context containing request and metadata.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the route can be activated, `false` otherwise.
   * @throws {UnauthorizedException} - If the user is not authorized to view the route.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const skiprole = this.reflector.getAllAndOverride<GUARDS[]>(
      SKIP_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skiprole && skiprole.includes(GUARDS.EMAIL)) {
      return true;
    }
    if (!request.user) {
      throw new UnauthorizedException(
        'You are not authorized to view this route',
      );
    }
    const user = await this.userservice.FindOne({ id: request.user.id });
    if (!user) {
      throw new UnauthorizedException(
        'You are not authorized to view this route',
      );
    }
    if (user.verified === 0) {
      throw new UnauthorizedException(
        'You are not authorized, please verify your account or contact admin',
      );
    }
    return true;
  }
}

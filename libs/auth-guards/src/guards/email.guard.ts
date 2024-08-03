import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '@services/core-services/services/auth/users/users.service';
import { GUARDS } from '@toolkit/core-toolkit/types/enums/enums';
import { Request } from 'express';
import { SKIP_GUARD_KEY } from '../decorators/skip.guard';

@Injectable()
export class EMailGuard implements CanActivate {
  constructor(
    private readonly userservice: UserService,
    private reflector: Reflector,
  ) {}
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

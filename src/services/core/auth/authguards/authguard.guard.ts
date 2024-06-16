import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenUser } from '../users/users.types';

import { RefreshTokenService } from '../refreshtokens/refreshtokens.service';
import { UserService } from '../users/users.service';

@Injectable()
export class VerifyJwtGuard implements CanActivate {
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
export class VerifyRefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshtoken: RefreshTokenService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    console.log(this.refreshtoken.entity);
    const token = await this.refreshtoken.ViewSingleRefreshtoken();
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
export class VerifyEMailGuard implements CanActivate {
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

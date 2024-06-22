import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { DECRYPT_KEY, decrypttype } from 'src/app/decorators/decrypt.decorator';
import { Utilities } from 'src/app/utils/app.utils';

@Injectable()
export class DecryptData implements NestInterceptor {
  constructor(
    @Inject(Utilities) private readonly utils: Utilities,
    private reflector: Reflector,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const decrypt = this.reflector.getAllAndOverride<decrypttype>(DECRYPT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (decrypt) {
      const decrypttype = request[decrypt.type];
      Object.keys(decrypttype).forEach((key) => {
        if (decrypt.keys.includes(key)) {
          if (decrypt?.decrypttype === 'uri') {
            decrypttype[key] = this.utils.decryptUrl(decrypttype[key]);
          } else {
            decrypttype[key] = this.utils.decryptData(decrypttype[key]);
          }
        }
      });
      request[decrypt.type] = decrypttype;
    }
    return next.handle();
  }
}

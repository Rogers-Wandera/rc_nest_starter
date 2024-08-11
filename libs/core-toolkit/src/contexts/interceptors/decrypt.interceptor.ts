import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CoreToolkitService } from '@toolkit/core-toolkit/core-toolkit.service';
import { DECRYPT_KEY } from '@toolkit/core-toolkit/decorators/decrypt.decorator';
import { decrypttype } from '@toolkit/core-toolkit/types/coretypes';
import { Request } from 'express';

@Injectable()
export class DecryptData implements NestInterceptor {
  constructor(
    private readonly utils: CoreToolkitService,
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

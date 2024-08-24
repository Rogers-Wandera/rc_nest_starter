import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CoreToolkitService } from '../../coretoolkit.service';
import { DECRYPT_KEY } from '../../decorators/decrypt.decorator';
import { decrypttype } from '../../types/coretypes';
import { Request } from 'express';

/**
 * Interceptor for decrypting request data.
 * It decrypts specified fields in the request based on metadata provided by the `@Decrypt` decorator.
 *
 * @class DecryptData
 * @implements {NestInterceptor}
 */
@Injectable()
export class DecryptData implements NestInterceptor {
  /**
   * Creates an instance of `DecryptData`.
   *
   * @param {CoreToolkitService} utils - The service used for decryption operations.
   * @param {Reflector} reflector - The Reflector instance for retrieving metadata.
   */
  constructor(
    private readonly utils: CoreToolkitService,
    private reflector: Reflector,
  ) {}

  /**
   * Intercepts the request and decrypts specified fields based on metadata.
   * The fields to be decrypted are determined by the metadata retrieved from the `@Decrypt` decorator.
   *
   * @param {ExecutionContext} context - The context of the current request.
   * @param {CallHandler} next - The handler to call after the interception.
   * @returns {Observable<any>} - The result of the handler.
   */
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

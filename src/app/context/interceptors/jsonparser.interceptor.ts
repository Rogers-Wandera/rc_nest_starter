import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Paramtype,
  Scope,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class TransformJson<T> implements NestInterceptor {
  constructor(
    private readonly key: keyof T | string[],
    private readonly type: Paramtype,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const query = request[this.type];
    if (Array.isArray(this.key)) {
      this.key.forEach((key) => {
        if (query && query[key]) {
          const data = JSON.parse(query[key]);
          request[this.type][key] = data;
        } else {
          throw new BadRequestException(`Invalid JSON in ${String(key)}`);
        }
      });
    } else {
      if (query && query[this.key]) {
        const data = JSON.parse(query[this.key]);
        request[this.type][this.key] = data;
      } else {
        throw new BadRequestException(`Invalid JSON in ${String(this.key)}`);
      }
    }
    return next.handle();
  }
}

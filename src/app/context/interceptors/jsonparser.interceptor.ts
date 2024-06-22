import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Paramstype } from 'src/app/app.types';
import { PAGINATE_KEY } from 'src/app/decorators/pagination.decorator';

@Injectable({ scope: Scope.REQUEST })
export class TransformJson<T> implements NestInterceptor {
  constructor(
    private readonly key: keyof T | string[],
    private readonly type: Paramstype,
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

@Injectable({ scope: Scope.REQUEST })
export class TransformPainateQuery implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const paginate = this.reflector.getAllAndOverride<string>(PAGINATE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (paginate) {
      const request: Request = context.switchToHttp().getRequest();
      if (request.query) {
        if (request.query['sortBy']) {
          request.query['sortBy'] = JSON.parse(
            request.query['sortBy'] as string,
          );
        }
        if (request.query['filters']) {
          request.query['filters'] = JSON.parse(
            request.query['filters'] as string,
          );
        }

        if (request.query['conditions']) {
          request.query['conditions'] = JSON.parse(
            request.query['conditions'] as string,
          );
        }
      }
    }
    return next.handle();
  }
}

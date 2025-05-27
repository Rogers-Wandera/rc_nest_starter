import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PAGINATE_KEY } from '../../decorators/pagination.decorator';
import { Paramstype } from '../../types/coretypes';

/**
 * Interceptor for transforming JSON string values in request parameters.
 *
 * @class TransformJson
 * @implements {NestInterceptor}
 * @template T - The type of the request parameters.
 */
@Injectable()
export class TransformJson<T> implements NestInterceptor {
  /**
   * Creates an instance of `TransformJson`.
   *
   * @param {keyof T | string[]} key - The key or keys of the request parameters to transform.
   * @param {Paramstype} type - The type of request data to transform (e.g., body, query, params).
   */
  constructor(
    private readonly key: keyof T | string[],
    private readonly type: Paramstype,
  ) {}
  /**
   * Intercepts the request and transforms JSON string values into objects.
   *
   * @param {ExecutionContext} context - The context of the current request.
   * @param {CallHandler} next - The handler to call after the interception.
   * @throws {BadRequestException} - If the JSON string is invalid or cannot be parsed.
   */
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

/**
 * Interceptor for transforming pagination query parameters from JSON strings.
 *
 * @class TransformPaginateQuery
 * @implements {NestInterceptor}
 */
@Injectable()
export class TransformPainateQuery implements NestInterceptor {
  /**
   * Creates an instance of `TransformPaginateQuery`.
   *
   * @param {Reflector} reflector - The Reflector instance for retrieving metadata.
   */
  constructor(private reflector: Reflector) {}
  /**
   * Intercepts the request and transforms pagination query parameters from JSON strings.
   *
   * @param {ExecutionContext} context - The context of the current request.
   * @returns {Observable<any>} - The result of the handler.
   */
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

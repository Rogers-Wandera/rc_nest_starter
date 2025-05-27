import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  PipeTransform,
} from '@nestjs/common';
import Joi, { ObjectSchema } from 'joi';
import { Request } from 'express';
import { INQUIRER, Reflector } from '@nestjs/core';
import { PAGINATE_KEY } from '../../decorators/pagination.decorator';
import { PaginationSchema } from '../../../corecontroller/schemas/core/paginate.schema';
import { ControllerInterface } from '../../../corecontroller/controller.interface';
import { ObjectLiteral } from 'typeorm';
import { Paramstype } from '../../types/coretypes';
import { paginateprops } from '../../types/coretypes';
import { SCHEMA_KEY, schema_validate } from '../../decorators/schema.decorator';

type schema<R> = ObjectSchema<R>;

/**
 * Custom pipe for validating data using Joi schemas.
 *
 * @class JoiValidationPipe
 * @implements {PipeTransform}
 * @template T - The type of the data to validate.
 */

export class JoiValidationPipe<T> implements PipeTransform {
  constructor(private schema: schema<T>) {}
  transform(value: any) {
    try {
      const parsed = this.schema.validate(value);
      return parsed;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

/**
 * Interceptor for validating pagination query parameters using Joi.
 *
 * @class JoiPaginateValidation
 * @implements {NestInterceptor}
 * @template T - The type of the pagination parameters.
 */

@Injectable()
export class JoiPaginateValidation<T> implements NestInterceptor {
  /**
   * Creates an instance of `JoiPaginateValidation`.
   *
   * @param {Reflector} reflector - The Reflector instance for retrieving metadata.
   * @param {ControllerInterface} parentClass - The parent controller interface.
   */
  constructor(
    private reflector: Reflector,
    @Inject(INQUIRER) private parentClass: ControllerInterface,
  ) {}

  /**
   * Intercepts the request and validates pagination parameters using Joi.
   *
   * @param {ExecutionContext} context - The context of the current request.
   * @param {CallHandler} next - The handler to call after the interception.
   * @throws {BadRequestException} - If validation fails.
   */
  intercept(context: ExecutionContext, next: CallHandler) {
    const paginate = this.reflector.getAllAndOverride<string>(PAGINATE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (paginate) {
      const request: Request = context.switchToHttp().getRequest();
      const query = request.query;
      const schema = PaginationSchema<T>(query);
      const { error, value: parsedValue } = schema.validate(query);
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join('; ');
        throw new BadRequestException(errorMessage);
      }
      const entity: ObjectLiteral = this.parentClass.model.entity;
      request.query = parsedValue;
      request.validatorName = entity.constructor.name;
      this.parentClass.model.pagination = parsedValue as paginateprops<unknown>;
    }
    return next.handle();
  }
}

/**
 * Interceptor for validating request data using a Joi schema.
 *
 * @class JoiValidator
 * @implements {NestInterceptor}
 * @template T - The type of the request data.
 */
@Injectable()
export class JoiValidator<T> implements NestInterceptor {
  constructor(
    private schema: schema<T>,
    private type: Paramstype,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const data: T = request[this.type];
    const { error, value: parsedValue } = this.schema.validate(data);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join('; ');
      throw new BadRequestException(errorMessage);
    }
    request[this.type] = parsedValue;
    return next.handle();
  }
}

/**
 * Interceptor for validating request data against multiple Joi schemas.
 *
 * @class JoiSchemaValidator
 * @implements {NestInterceptor}
 */
@Injectable()
export class JoiSchemaValidator implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(INQUIRER) private parentClass: ControllerInterface,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest() as Request;
    const method = request.method.toLowerCase();
    const schemas = this.reflector.getAllAndOverride<schema_validate>(
      SCHEMA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (schemas) {
      const entity: ObjectLiteral = this.parentClass.model.entity;
      const type = schemas.type || 'body';
      const data: Record<string, unknown> = request[type];
      const schema = schemas.schemas.reduce((acc, schema) => {
        return acc.concat(schema);
      }, Joi.object());
      const { error, value } = schema.validate(data);
      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join('; ');
        throw new BadRequestException(errorMessage);
      }
      if (schemas.schemas.length === 1) {
        request.validatorName = entity.constructor.name;
        if (request.user) {
          if (method != 'post') {
            entity['updatedBy'] = request.user.id;
          } else {
            entity['createdBy'] = request.user.id;
            entity['updatedBy'] = request.user.id;
          }
        }

        this.parentClass.model.entity = { ...entity, ...value };
      }
    }
    return next.handle();
  }
}

import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import Joi, { ObjectSchema } from 'joi';
import { Request } from 'express';
import { INQUIRER, Reflector } from '@nestjs/core';
import { PAGINATE_KEY } from '@toolkit/core-toolkit/decorators/pagination.decorator';
import { PaginationSchema } from '@controller/core-controller/schemas/core/paginate.schema';
import { ControllerInterface } from '@controller/core-controller/controller.interface';
import { ObjectLiteral } from 'typeorm';
import { Paramstype } from '@toolkit/core-toolkit/types/coretypes';
import { paginateprops } from '@toolkit/core-toolkit/types/coretypes';
import {
  SCHEMA_KEY,
  schema_validate,
} from '@toolkit/core-toolkit/decorators/schema.decorator';

type schema<R> = ObjectSchema<R>;

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

@Injectable({ scope: Scope.REQUEST })
export class JoiPaginateValidation<T> implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(INQUIRER) private parentClass: ControllerInterface,
  ) {}
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
      request.query = parsedValue;
      this.parentClass.model.pagination = parsedValue as paginateprops<unknown>;
    }
    return next.handle();
  }
}

@Injectable({ scope: Scope.REQUEST })
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

@Injectable({ scope: Scope.REQUEST })
export class JoiSchemaValidator implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(INQUIRER) private parentClass: ControllerInterface,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest() as Request;
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
        if (request.user) {
          entity['createdBy'] = request.user.id;
          entity['updatedBy'] = request.user.id;
        }

        this.parentClass.model.entity = { ...entity, ...value };
      }
    }
    return next.handle();
  }
}

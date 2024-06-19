import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Paramtype,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { paginateprops } from '../../conn/conntypes';
import { CustomAppError } from '../../context/app.error';
import { Request } from 'express';
import { INQUIRER, Reflector } from '@nestjs/core';
import { PAGINATE_KEY } from 'src/app/decorators/pagination.decorator';
import { PaginationSchema } from 'src/schemas/core/paginate.schema';
import { ControllerInterface } from 'src/controllers/controller.interface';

type schema<R> = ObjectSchema<R>;

export class JoiValidationPipe<T> implements PipeTransform {
  constructor(private schema: schema<T>) {}
  transform(value: any) {
    try {
      const parsed = this.schema.validate(value);
      return parsed;
    } catch (error) {
      throw new CustomAppError(error.message, 400, error, 'ValidationError');
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
    private type: Paramtype,
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

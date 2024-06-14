import {
  ArgumentMetadata,
  BadRequestException,
  CallHandler,
  ExecutionContext,
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
import { catchError, throwError } from 'rxjs';

type schema<R> = ObjectSchema<R>;
type paginateFactory<T> = (itemSchema: {
  [key: string]: any;
}) => ObjectSchema<paginateprops<T>>;

export class JoiValidationPipe<T> implements PipeTransform {
  constructor(private schema: schema<T>) {}
  transform(value: any, metadata: ArgumentMetadata) {
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
  constructor(private schemaFactory: paginateFactory<T>) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const query = request.query;
    const schema = this.schemaFactory(query);
    const { error, value: parsedValue } = schema.validate(query);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join('; ');
      throw new BadRequestException(errorMessage);
    }
    request.query = parsedValue;
    return next.handle();
  }
}

import { ControllerInterface } from '@controller/core-controller/controller.interface';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { INQUIRER, Reflector } from '@nestjs/core';
import { CLASS_VALIDATOR_KEY } from '@toolkit/core-toolkit/decorators/classvalidator.decorator';
import { ClassValidatorType } from '@toolkit/core-toolkit/types/coretypes';
import { validate } from 'class-validator';
import { Request } from 'express';

/**
 * Interceptor for validating request data using class-validator.
 * It extracts validation metadata from the request handler and class, performs validation,
 * and sets `createdBy` and `updatedBy` fields if a user is authenticated.
 *
 * @class ClassValidatorInterceptor
 * @implements {NestInterceptor}
 */
@Injectable({ scope: Scope.REQUEST })
export class ClassValidatorInterceptor implements NestInterceptor {
  /**
   * Creates an instance of `ClassValidatorInterceptor`.
   *
   * @param {Reflector} reflector - The Reflector instance for retrieving metadata.
   * @param {ControllerInterface} parentClass - The parent class implementing `ControllerInterface`.
   */
  constructor(
    private reflector: Reflector,
    @Inject(INQUIRER) private parentClass: ControllerInterface,
  ) {}

  /**
   * Intercepts the request and validates the data based on metadata extracted from the handler and class.
   * If validation errors are found, a `BadRequestException` is thrown.
   * If the request is authenticated, sets `createdBy` and `updatedBy` fields on the entity.
   *
   * @param {ExecutionContext} context - The context of the current request.
   * @param {CallHandler<any>} next - The handler to call after the interception.
   *
   * @throws {BadRequestException} - If validation errors are present.
   */
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request: Request = context.switchToHttp().getRequest();
    const check = this.reflector.getAllAndOverride<ClassValidatorType>(
      CLASS_VALIDATOR_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (check) {
      const dto = new check.classDTO();
      const data = (
        check.type ? request[check.type] : request.body
      ) as typeof check.classDTO;
      Object.assign(dto, data);
      const errors = await validate(dto);
      if (errors.length > 0) {
        const message = errors
          .map((err) => err.constraints[Object.keys(err.constraints)[0]])
          .join(', ');
        throw new BadRequestException(message);
      }
      if (request.user) {
        if (this.parentClass) {
          this.parentClass.model.entity['createdBy'] = request.user.id;
          this.parentClass.model.entity['updatedBy'] = request.user.id;
        }
      }
    }
    return next.handle();
  }
}

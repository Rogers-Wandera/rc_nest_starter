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

@Injectable({ scope: Scope.REQUEST })
export class ClassValidatorInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(INQUIRER) private parentClass: ControllerInterface,
  ) {}
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

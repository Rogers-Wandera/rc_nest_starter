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
import { Request } from 'express';
import {
  VALIDATE_SERVICE,
  servicevalidate,
} from 'src/app/decorators/servicevalidate.decorator';
import { ControllerInterface } from 'src/controllers/controller.interface';
import { EntityDataSource } from 'src/model/enity.data.model';
import { ObjectLiteral } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class ServiceValidator implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private source: EntityDataSource,
    @Inject(INQUIRER) private parentClass: ControllerInterface,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const services = this.reflector.getAllAndOverride<
      servicevalidate<ObjectLiteral>[]
    >(VALIDATE_SERVICE, [context.getHandler(), context.getClass()]);
    const entityobj = {};
    if (services) {
      const entity: ObjectLiteral = this.parentClass.model.entity;
      const parentClassName = entity.constructor.name;
      const request: Request = context.switchToHttp().getRequest();
      const promises = services.map(async (service) => {
        const type = service.type || 'params';
        const name = service.name || 'Record';
        const field = service.field || 'id';
        const repository = this.source.getRepository(service.entity);
        const exists = await repository.findOne({
          where: { [field]: request[type][service.key] },
        });
        if (!exists) {
          throw new BadRequestException(
            `No ${name} found with ${service.key} of ${request[type][service.key]}`,
          );
        }
        const classname = repository.metadata.name;
        if (classname === parentClassName) {
          this.parentClass.model.entity = exists;
        } else {
          entityobj[service.key] = exists;
        }
      });
      await Promise.all(promises);
      request.entities = entityobj;
    }
    return next.handle();
  }
}

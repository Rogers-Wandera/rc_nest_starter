import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
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
import {
  servicevalidate,
  VALIDATE_SERVICE,
} from '@toolkit/core-toolkit/decorators/servicevalidate.decorator';
import { Request } from 'express';
import { ControllerInterface } from '@controller/core-controller/controller.interface';
import { BaseEntityClass } from '@entity/entities/base.entity';

@Injectable({ scope: Scope.REQUEST })
export class ServiceValidator implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private source: EntityDataSource,
    @Inject(INQUIRER) private parentClass: ControllerInterface,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const services = this.reflector.getAllAndOverride<
      servicevalidate<BaseEntityClass>[] | servicevalidate<BaseEntityClass>
    >(VALIDATE_SERVICE, [context.getHandler(), context.getClass()]);
    const entityobj = {};
    if (services) {
      const entity: BaseEntityClass = this.parentClass.model.entity;
      const parentClassName = entity.constructor.name;
      const request: Request = context.switchToHttp().getRequest();
      if (Array.isArray(services)) {
        const promises = services.map(async (service) => {
          await this.ValidateService(
            service,
            request,
            parentClassName,
            entityobj,
          );
        });
        await Promise.all(promises);
      } else {
        await this.ValidateService(
          services,
          request,
          parentClassName,
          entityobj,
        );
      }
      request.entities = entityobj;
    }
    return next.handle();
  }

  private async ValidateService(
    service: servicevalidate<BaseEntityClass>,
    request: Request,
    parentClassName: string,
    entityobj: { [key: string]: any },
  ) {
    const type = service.type || 'params';
    const name = service.name || 'Record';
    const field = service.field || 'id';
    let key = service?.key;
    if (Object.keys(request[type]).length <= 0) {
      throw new BadRequestException(`No data found in request [${type}]`);
    }
    if (!service.key) {
      key = Object.keys(request[type])[0];
    }
    if (!request[type][key]) {
      throw new BadRequestException(
        `Service validator could not find the key specified [${key}]`,
      );
    }
    const repository = this.source.getRepository(service.entity);
    const exists = await repository.findOne({
      where: { [field]: request[type][key] },
    });
    if (!exists) {
      throw new BadRequestException(
        `No ${name} found with ${key} of ${request[type][key]}`,
      );
    }
    const classname = repository.metadata.name;
    if (classname === parentClassName) {
      this.parentClass.model.entity = exists;
      entityobj[classname.toLowerCase()] = exists;
    } else {
      // entityobj[key] = exists;
      entityobj[classname.toLowerCase()] = exists;
    }
  }
}

import { EntityDataSource } from '../../../databridge/model/enity.data.model';
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
} from '../../decorators/servicevalidate.decorator';
import { Request } from 'express';
import { ControllerInterface } from '../../../corecontroller/controller.interface';
import { BaseEntityClass } from '../../../entities/base.entity';
import { EntityTarget } from 'typeorm';

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
      const method = request.method.toLowerCase();
      const validations = Array.isArray(services) ? services : [services];
      for (const service of validations) {
        await this.ValidateService(
          service,
          request,
          parentClassName,
          entityobj,
          context,
        );
      }
      request.entities = entityobj;
      if (request.user) {
        if (this.parentClass) {
          if (method != 'post') {
            this.parentClass.model.entity['updatedBy'] = request.user.id;
          } else {
            this.parentClass.model.entity['createdBy'] = request.user.id;
            this.parentClass.model.entity['updatedBy'] = request.user.id;
          }
        }
      }
    }
    return next.handle();
  }

  private async ValidateService(
    service: servicevalidate<BaseEntityClass>,
    request: Request,
    parentClassName: string,
    entityobj: { [key: string]: any },
    context: ExecutionContext,
  ) {
    const type = service.type || 'params';

    const field = service.field
      ? typeof service.field === 'function'
        ? service.field(context)
        : service.field
      : 'id';
    let key =
      typeof service.key === 'function' ? service.key(context) : service.key;
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
    const entitytarget = this.isEntityFunction(service.entity)
      ? service.entity(context)
      : service.entity;
    const repository = this.source.getRepository(entitytarget);
    const classname = repository.metadata.name;
    const name = service.name || classname.toLowerCase();
    const exists = await repository.findOne({
      where: { [field]: request[type][key] },
    });
    if (!exists) {
      throw new BadRequestException(
        `No ${name} found with ${key} of ${request[type][key]}`,
      );
    }

    if (classname === request?.validatorName) {
      this.parentClass.model.entity = {
        ...this.parentClass.model.entity,
        ...exists,
      };
      entityobj[classname.toLowerCase()] = exists;
    } else if (classname === parentClassName) {
      this.parentClass.model.entity = {
        ...this.parentClass.model.entity,
        ...exists,
      };
      entityobj[classname.toLowerCase()] = exists;
    } else {
      entityobj[classname.toLowerCase()] = exists;
    }
  }

  private isEntityFunction<T>(
    entity: EntityTarget<T> | ((context: ExecutionContext) => EntityTarget<T>),
  ): entity is (context: ExecutionContext) => EntityTarget<T> {
    return typeof entity === 'function' && entity.length === 1;
  }
}

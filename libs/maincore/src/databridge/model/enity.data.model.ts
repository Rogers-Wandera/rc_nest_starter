import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { EntityTarget, ObjectLiteral } from 'typeorm';
import { ModelService } from './model.service';
import { CustomRepository } from '../ormextender/customrepository';

@Injectable()
export class EntityDataSource {
  public request: Request;
  constructor(
    private model: ModelService,
    @Inject(REQUEST) request: Request,
  ) {
    this.request = request;
  }

  public getModel<T>(caller: T) {
    return this.model.getModel(caller);
  }

  public GetRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): CustomRepository<T> {
    return this.getModel('pass').getRepository(entity);
  }
}

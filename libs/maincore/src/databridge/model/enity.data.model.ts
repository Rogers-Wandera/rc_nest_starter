import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { EntityTarget } from 'typeorm';
import { DataBridgeService } from '../databridge.service';

@Injectable()
export class EntityDataSource {
  public model: DataBridgeService;
  public request: Request;
  constructor(
    @Inject('data_source') model: DataBridgeService,
    @Inject(REQUEST) request: Request,
  ) {
    this.request = request;
    this.model = model;
  }
  public getRepository<T>(entity: EntityTarget<T>) {
    return this.model.GetRepository(entity);
  }
}

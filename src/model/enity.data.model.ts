import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DatabaseService } from 'src/db/database.provider';

@Injectable({ scope: Scope.REQUEST })
export class EntityDataSource {
  public model: DatabaseService;
  public request: Request;
  constructor(
    @Inject('data_source') model: DatabaseService,
    @Inject(REQUEST) request: Request,
  ) {
    this.request = request;
    this.model = model;
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { EntityTarget } from 'typeorm';

export const File = createParamDecorator(
  (data: keyof Express.Multer.File, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const file = request.file as Express.Multer.File;
    return data ? file?.[data] : file;
  },
);
export const Files = createParamDecorator(
  (data: keyof Express.Multer.File, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const files = request.files as Express.Multer.File[];
    return data ? files.map((file) => file[data]) : files;
  },
);

export const Service = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const entity = request.entities[data] as EntityTarget<unknown>;
    return entity;
  },
);

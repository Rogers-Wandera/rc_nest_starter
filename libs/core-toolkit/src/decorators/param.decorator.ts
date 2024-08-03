import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

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

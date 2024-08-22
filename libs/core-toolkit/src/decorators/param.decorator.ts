import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { EntityTarget } from 'typeorm';
import { ValidateService } from './servicevalidate.decorator';

/**
 * Custom decorator to extract a single uploaded file or a specific property of the file from the request.
 *
 * @param data - The key of the `Express.Multer.File` object to extract (e.g., `filename`, `mimetype`).
 * If not provided, the entire file object is returned.
 * @param ctx - The execution context of the request.
 *
 * @returns The entire file object or the specified property of the file.
 *
 * @example
 * ```typescript
 * @Post('upload')
 * uploadFile(@File('filename') filename: string) {
 *   console.log(filename);
 * }
 * ```
 */
export const File = createParamDecorator(
  (data: keyof Express.Multer.File, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const file = request.file as Express.Multer.File;
    return data ? file?.[data] : file;
  },
);

/**
 * Custom decorator to extract multiple uploaded files or specific properties of those files from the request.
 *
 * @param data - The key of the `Express.Multer.File` object to extract from each file (e.g., `filename`, `mimetype`).
 * If not provided, the entire file objects array is returned.
 * @param ctx - The execution context of the request.
 *
 * @returns An array of the entire files or the specified properties of the files.
 *
 * @example
 * ```typescript
 * @Post('upload-multiple')
 * uploadFiles(@Files('filename') filenames: string[]) {
 *   console.log(filenames);
 * }
 * ```
 */
export const Files = createParamDecorator(
  (data: keyof Express.Multer.File, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const files = request.files as Express.Multer.File[];
    return data ? files.map((file) => file[data]) : files;
  },
);

/**
 * Custom decorator to retrieve an entity from the request based on the provided entity name.
 * This entity is set when the ValidateService decorator is called.
 * @see {@link ValidateService}
 *
 * @param data - The name of the entity to retrieve. If not provided, the first entity in the request is returned.
 * The name of the entity comes for example if Validation happened on the User entity then data can be 'user'
 * @param ctx - The execution context of the request.
 *
 * @returns The requested entity or the first entity in the request.
 *
 * @example
 * ```typescript
 * @Get('entity')
 * getEntity(@Service('User') userEntity: EntityTarget<unknown>) {
 *   console.log(userEntity);
 * }
 * ```
 */
export const Service = createParamDecorator(
  (data: string | null, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    let entity: EntityTarget<unknown> | null = null;
    if (data) {
      entity = request.entities[data] as EntityTarget<unknown>;
    } else {
      entity = request.entities[
        Object.keys(request.entities)[0]
      ] as EntityTarget<unknown>;
    }
    return entity;
  },
);

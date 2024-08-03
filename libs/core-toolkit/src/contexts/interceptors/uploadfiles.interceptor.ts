import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CoreToolkitService } from '@toolkit/core-toolkit/core-toolkit.service';
import { UPLOAD_KEY } from '@toolkit/core-toolkit/metakeys/metakeys';
import { FileUploadType } from '@toolkit/core-toolkit/types/coretypes';
import { Request } from 'express';

@Injectable()
export class UploadFileInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private utils: CoreToolkitService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request: Request = context.switchToHttp().getRequest();
    const check = this.reflector.getAllAndOverride<FileUploadType>(UPLOAD_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!check) {
      return next.handle();
    }
    this.SizeValidator(request, check);
    this.MimeTypeValidator(request, check);
    this.FilesCountValidator(request, check);
    return next.handle();
  }

  private SizeValidator(req: Request, check: FileUploadType) {
    const maxSize = check.maxSize || 5 * 1024 * 1024; // 5mbs;
    if (check.type === 'single') {
      const file = req.file as Express.Multer.File;
      const check = file.size <= maxSize;
      if (!check) {
        throw new BadRequestException(
          `File size should not exceed ${Math.round(maxSize / (1024 * 1024))}mbs, Got ${Math.round(file.size / (1024 * 1024))}mbs`,
        );
      }
    } else {
      const files = req.files as Express.Multer.File[];
      const checker = files.every((file) => file.size <= maxSize);
      if (!checker) {
        throw new BadRequestException(
          `One or more files exceeds the required size of  ${Math.round(maxSize / (1024 * 1024))} mbs`,
        );
      }
    }
    return true;
  }

  private MimeTypeValidator(req: Request, check: FileUploadType) {
    if (check.type === 'single') {
      const file = req.file as Express.Multer.File;
      const { checker, message } = this.utils.checktype(file, check);
      if (!checker) {
        throw new BadRequestException(message);
      }
    } else {
      const files = req.files as Express.Multer.File[];
      const validate = files.every((file) => {
        const { checker } = this.utils.checktype(file, check);
        return checker;
      });
      if (!validate) {
        throw new BadRequestException(
          `One or more File has unsupported extension`,
        );
      }
    }
    return true;
  }

  private FilesCountValidator(req: Request, check: FileUploadType) {
    if (check.type === 'multiple') {
      const files = req.files as Express.Multer.File[];
      const fileCount = check.fileCount || 3;
      const validate = files.length <= fileCount;
      if (!validate) {
        throw new BadRequestException(
          `Please provide exactly ${fileCount} files or less`,
        );
      }
    }
  }
}

import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CoreToolkitService } from '../../coretoolkit.service';
import { UPLOAD_KEY } from '../../metakeys/metakeys';
import { FileUploadType } from '../../types/coretypes';
import { Request } from 'express';

/**
 * Interceptor that handles file upload validation.
 * Validates file size, MIME type, and file count according to the provided metadata.
 * @see {@link FileUploadType}
 */
@Injectable()
export class UploadFileInterceptor implements NestInterceptor {
  /**
   * Creates an instance of UploadFileInterceptor.
   * @param {Reflector} reflector - Reflector to get metadata.
   * @param {CoreToolkitService} utils - Utility service for file type checking.
   */
  constructor(
    private reflector: Reflector,
    private utils: CoreToolkitService,
  ) {}

  /**
   * Intercepts the request and performs file validation.
   * @param {ExecutionContext} context - The execution context.
   * @param {CallHandler<any>} next - The next handler in the pipeline.
   */
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

  /**
   * Validates the size of the uploaded file(s).
   * @param {Request} req - The HTTP request containing the file(s).
   * @param {FileUploadType} check - The file upload type metadata.
   * @throws {BadRequestException} If the file size exceeds the limit.
   */
  private SizeValidator(req: Request, check: FileUploadType) {
    let maxSize = 5 * 1024 * 1024; // 5MB
    if (check?.maxSize) {
      maxSize = check.maxSize * 1024 * 1024;
    }
    if (check.type === 'single') {
      const file = req.file as Express.Multer.File;
      const check = file.size <= maxSize;
      if (!check) {
        throw new BadRequestException(
          `File size should not exceed ${Math.round(maxSize / (1024 * 1024))}MB, Got ${Math.round(file.size / (1024 * 1024))}MB`,
        );
      }
    } else {
      const files = req.files as Express.Multer.File[];
      const checker = files.every((file) => file.size <= maxSize);
      if (!checker) {
        throw new BadRequestException(
          `One or more files exceed the required size of ${Math.round(maxSize / (1024 * 1024))}MB`,
        );
      }
    }
    return true;
  }

  /**
   * Validates the MIME type of the uploaded file(s).
   * @param {Request} req - The HTTP request containing the file(s).
   * @param {FileUploadType} check - The file upload type metadata.
   * @throws {BadRequestException} If the file type is not allowed.
   */
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
          `One or more files have unsupported extensions`,
        );
      }
    }
    return true;
  }

  /**
   * Validates the number of uploaded files.
   * @param {Request} req - The HTTP request containing the file(s).
   * @param {FileUploadType} check - The file upload type metadata.
   * @throws {BadRequestException} If the number of files exceeds the allowed limit.
   */
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

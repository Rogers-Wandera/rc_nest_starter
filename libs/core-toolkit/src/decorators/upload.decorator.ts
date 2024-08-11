import { applyDecorators, UseInterceptors, SetMetadata } from '@nestjs/common';
import { FileUploadType } from '../types/coretypes';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UPLOAD_KEY } from '../metakeys/metakeys';
import { UploadFileInterceptor } from '../contexts/interceptors/uploadfiles.interceptor';

export function UploadFile(type: FileUploadType) {
  if (type.type === 'single') {
    return applyDecorators(
      SetMetadata(UPLOAD_KEY, type),
      UseInterceptors(FileInterceptor(type.source), UploadFileInterceptor),
    );
  } else if (type.type === 'multiple') {
    return applyDecorators(
      SetMetadata(UPLOAD_KEY, type),
      UseInterceptors(
        FilesInterceptor(type.source, type.fileCount || 5),
        UploadFileInterceptor,
      ),
    );
  }
}

import { applyDecorators, UseInterceptors, SetMetadata } from '@nestjs/common';
import { FileUploadType } from '../types/coretypes';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UPLOAD_KEY } from '../metakeys/metakeys';
import { UploadFileInterceptor } from '../contexts/interceptors/uploadfiles.interceptor';

/**
 * A decorator that applies metadata and interceptors for handling file uploads.
 *
 * Depending on the specified `FileUploadType`, it configures the route handler to manage single
 * or multiple file uploads using the appropriate interceptors.
 *
 * @param {FileUploadType} type - Configuration object specifying the upload type and related options.
 * @param {'single' | 'multiple'} type.type - Specifies whether the upload is for a single or multiple files.
 * @param {string} type.source - The name of the field that holds the file(s) in the request.
 * @param {number} [type.fileCount=5] - Optional, only used for multiple files; specifies the maximum number of files to upload.
 *
 * @example
 * \@UploadFile({ type: 'single', source: 'profileImage' })
 * \@Post('upload-profile-image')
 * uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
 *   // Handle the uploaded file
 * }
 *
 * @example
 * \@UploadFile({ type: 'multiple', source: 'photos', fileCount: 10 })
 * \@Post('upload-photos')
 * uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
 *   // Handle the uploaded files
 * }
 */
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

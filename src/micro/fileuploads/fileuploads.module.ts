import { Global, Module } from '@nestjs/common';
import { CloudinaryUpload } from './cloudinary.upload';

@Global()
@Module({
  providers: [CloudinaryUpload],
  exports: [CloudinaryUpload],
})
export class FileUploadsModule {}

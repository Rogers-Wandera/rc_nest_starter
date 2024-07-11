import { Module } from '@nestjs/common';
import { UserProfileImageService } from './userprofileimages.service';

@Module({
  providers: [UserProfileImageService],
  exports: [UserProfileImageService],
})
export class UserProfileImageModule {}

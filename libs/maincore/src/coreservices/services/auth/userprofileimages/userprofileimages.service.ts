import { Injectable } from '@nestjs/common';
import { UserProfileImage } from '../../../../entities/core/userprofileimages.entity';
import {
  Cloudinary_Upload,
  CloudinaryUpload,
} from '../../../../coretoolkit/micro/fileuploads/cloudinary.upload';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { USER_EVENTS } from '@core/maincore/coretoolkit/types/enums/enums';
import { EventsGateway } from '@core/maincore/coretoolkit/events/event.gateway';

@Injectable()
export class UserProfileImageService extends EntityModel<UserProfileImage> {
  constructor(
    source: EntityDataSource,
    private readonly cloudinary: CloudinaryUpload,
    private readonly socket: EventsGateway,
  ) {
    super(UserProfileImage, source);
  }
  async AddUserprofileimages(image: Express.Multer.File) {
    try {
      const options: Cloudinary_Upload = {
        options: {
          folder: `userprofiles/${this.entity.user.id}`,
          use_filename: true,
          unique_filename: true,
          overwrite: true,
        },
        files: [image],
        meta: { userId: this.entity.user.id, type: 'Profile Picture' },
        pattern: USER_EVENTS.PROFILE_UPLOAD,
      };
      this.cloudinary.options = options;
      const cloudres = this.cloudinary.upload();
      return cloudres;
    } catch (error) {
      throw error;
    }
  }
}

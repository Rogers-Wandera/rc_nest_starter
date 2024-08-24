import { Injectable } from '@nestjs/common';
import { UserProfileImage } from '../../../../entities/core/userprofileimages.entity';
import { CloudinaryUpload } from '../../../../coretoolkit/micro/fileuploads/cloudinary.upload';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';

@Injectable()
export class UserProfileImageService extends EntityModel<UserProfileImage> {
  constructor(
    source: EntityDataSource,
    private readonly cloudinary: CloudinaryUpload,
  ) {
    super(UserProfileImage, source);
  }
  async AddUserprofileimages(image: Express.Multer.File) {
    try {
      const exists = await this.repository.findOneBy({
        user: { id: this.entity.user.id },
      });
      this.cloudinary.options.folder = `userprofiles/${this.entity.user.id}`;
      this.cloudinary.options.use_filename = true;
      this.cloudinary.options.unique_filename = true;
      this.cloudinary.options.overwrite = false;
      const cloudres = await this.cloudinary.singleUpload(image);
      if (exists) {
        const response = await this.repository.FindOneAndUpdate(
          {
            user: { id: this.entity.user.id },
          },
          { public_id: cloudres.public_id, image: cloudres.secure_url },
        );
        return response;
      }
      this.entity.createdBy = this.entity.user.id;
      this.entity.updatedBy = this.entity.user.id;
      this.entity.image = cloudres.secure_url;
      this.entity.public_id = cloudres.public_id;
      const response = await this.repository.save(this.entity);
      return response.id > 0;
    } catch (error) {
      throw error;
    }
  }
}

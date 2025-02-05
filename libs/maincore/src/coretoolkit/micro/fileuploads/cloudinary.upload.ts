import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, ResourceType, UploadApiOptions } from 'cloudinary';
import { RabbitMQService } from '../microservices/rabbitmq.service';
import { RabbitMQQueues, UPLOADER_PATTERN } from '../../types/enums/enums';

export type Cloudinary_Upload = {
  options: UploadApiOptions;
  meta?: Record<string, any>;
  files: Express.Multer.File[] | Express.Multer.File;
  pattern?: string;
};

/**
 * Service for handling file uploads to Cloudinary.
 * Implements the `IUpload` interface to provide methods for single and multiple file uploads,
 * as well as file deletions.
 *
 * @class CloudinaryUpload
 * @implements {IUpload}
 */
@Injectable()
export class CloudinaryUpload {
  public options: Cloudinary_Upload;

  constructor(private readonly client: RabbitMQService) {}

  /**
   * Uploads a single file to Cloudinary.
   */
  public upload() {
    try {
      if (!this.options) {
        throw new BadRequestException('Please provide cloudinary options');
      }
      this.client.setQueue(RabbitMQQueues.UPLOADS);
      const files = Array.isArray(this.options.files)
        ? this.options.files
        : [this.options.files];
      this.client.emit(UPLOADER_PATTERN.UPLOAD, {
        type: 'cloudinary',
        ...this.options,
        files,
      });
      return 'Upload is happening in the background, you will be notified when its done.';
    } catch (error) {
      throw error;
    }
  }
  /**
   * Deletes a file from Cloudinary.
   *
   * @param {string} public_id - The public ID of the file to be deleted.
   * @param {ResourceType} [type='image'] - The type of resource to be deleted (e.g., 'image', 'video').
   * @throws {Error} - Throws an error if the deletion fails.
   */
  async deleteUpload(public_id: string, type: ResourceType = 'image') {
    try {
      const response = await cloudinary.uploader.destroy(public_id, {
        resource_type: type,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

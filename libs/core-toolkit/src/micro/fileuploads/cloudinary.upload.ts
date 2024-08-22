import { Injectable } from '@nestjs/common';
import { IUpload } from './upload.interface';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  ConfigOptions,
  ResourceType,
  UploadApiOptions,
} from 'cloudinary';
import {
  cloudinaryconfig,
  EnvConfig,
} from '@toolkit/core-toolkit/config/config';

/**
 * Service for handling file uploads to Cloudinary.
 * Implements the `IUpload` interface to provide methods for single and multiple file uploads,
 * as well as file deletions.
 *
 * @class CloudinaryUpload
 * @implements {IUpload}
 */
@Injectable()
export class CloudinaryUpload implements IUpload {
  private readonly config: ConfigOptions;
  private readonly cloudenv: cloudinaryconfig;
  public options: UploadApiOptions;

  /**
   * Creates an instance of `CloudinaryUpload`.
   *
   * @param {ConfigService<EnvConfig>} configService - Service for accessing configuration values.
   */
  constructor(private readonly configService: ConfigService<EnvConfig>) {
    this.cloudenv = this.configService.get('cloudinary');
    this.config = {
      cloud_name: this.cloudenv.name,
      api_key: this.cloudenv.publicKey,
      api_secret: this.cloudenv.privateKey,
      secure: true,
    };
    this.options = {};
    cloudinary.config(this.config);
  }

  /**
   * Uploads a single file to Cloudinary.
   *
   * @param {Express.Multer.File} file - The file to be uploaded
   * @throws {Error} - Throws an error if the upload fails.
   * @private
   */
  private async upload(file: Express.Multer.File) {
    try {
      if (this.options.folder) {
        this.options = {
          ...this.options,
          folder: `${this.cloudenv.folder}/${this.options.folder}`,
        };
      } else {
        this.options = {
          ...this.options,
          folder: `${this.cloudenv.folder}`,
        };
      }

      const upload = await cloudinary.uploader.upload(file.path, this.options);
      return {
        public_id: upload.public_id,
        secure_url: upload.secure_url,
        url: upload.url,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Uploads a single file to Cloudinary.
   *
   * @param {Express.Multer.File} file - The file to be uploaded.
   */
  async singleUpload(file: Express.Multer.File) {
    try {
      const response = await this.upload(file);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Uploads multiple files to Cloudinary.
   *
   * @param {Express.Multer.File[]} files - An array of files to be uploaded.
   * @throws {Error} - Throws an error if any of the uploads fail.
   */
  async multipleUploads(files: Express.Multer.File[]) {
    try {
      const promises = files.map(async (file) => {
        const response = await this.upload(file);
        return response;
      });
      const response = await Promise.all(promises);
      return response;
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

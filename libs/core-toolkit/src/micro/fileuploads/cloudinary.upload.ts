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

@Injectable()
export class CloudinaryUpload implements IUpload {
  private readonly config: ConfigOptions;
  private readonly cloudenv: cloudinaryconfig;
  public options: UploadApiOptions;
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

  async singleUpload(file: Express.Multer.File) {
    try {
      const response = await this.upload(file);
      return response;
    } catch (error) {
      throw error;
    }
  }
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

import { Injectable, Logger } from '@nestjs/common';
import { EventsGateway } from '../event.gateway';
import { EventLogger } from '../../app/utils/event.logger';
import { UploadReturn } from '../../micro/fileuploads/upload.type';
import { USER_EVENTS } from '../../types/enums/enums';
import { CustomRepository } from '@core/maincore/databridge/ormextender/customrepository';
import { UserProfileImage } from '@core/maincore/entities/core/userprofileimages.entity';
import { User } from '@core/maincore/entities/core/users.entity';
import { ModelService } from '@core/maincore/databridge/model/model.service';

export type UploadErrorType = {
  error: string;
  filename: string;
  meta: { userId: string; [key: string]: any };
};

export type UploadProgressType = {
  progress: number;
  filename: string;
  meta: { userId: string; [key: string]: any };
};

@Injectable()
export class UploadEvents {
  private logger: Logger = new Logger(UploadEvents.name);
  private userservice: CustomRepository<User>;
  private userprofile: CustomRepository<UserProfileImage>;
  constructor(
    private readonly events: EventsGateway,
    private readonly eventslogger: EventLogger,
    private readonly source: ModelService,
  ) {
    this.userservice = this.source.getRepository(User);
    this.userprofile = this.source.getRepository(UserProfileImage);
  }

  // handleUpload(data: UploadErrorType) {
  //   if (!data?.meta?.userId) {
  //     return;
  //   }
  //   const usersocket = this.events.getClients().get(data.meta.userId);
  //   if (usersocket) {
  //     usersocket.emit('upload_error', {
  //       error: data.error,
  //       filename: data.filename,
  //     });
  //     this.eventslogger.logEvent(`File Upload Error`, 'user_events', {
  //       userId: data.meta.userId,
  //       eventType: 'UPLOAD_ERROR',
  //     });
  //     return;
  //   } else {
  //     this.logger.error(`User with id ${data.meta.userId} not connected`);
  //     this.logger.error(`Error: ${data.error} with filename: ${data.filename}`);
  //   }
  // }

  // handleUploadProgress(data: UploadProgressType) {
  //   if (!data?.meta?.userId || !data?.filename) {
  //     return;
  //   }
  //   const usersocket = this.events.getClients().get(data.meta.userId);
  //   if (usersocket) {
  //     usersocket.emit('upload_progress', data);
  //   } else {
  //     this.logger.error(`User with id ${data.meta.userId} not connected`);
  //     this.logger.error(
  //       `Upload Progress: ${data.progress} with filename: ${data.filename}`,
  //     );
  //   }
  // }

  async HandleUploadProfilePicture(data: UploadReturn) {
    try {
      this.logger.log(`${data?.data?.meta?.userId} : uploading profile image`);
      if (!data?.data?.meta?.userId || !data?.data?.meta?.type) {
        return;
      }
      if (data?.data?.meta?.type != 'Profile Picture') {
        return;
      }
      const exists = await this.userprofile.findOneBy({
        user: { id: data?.data?.meta?.userId },
      });
      if (exists) {
        exists.public_id = data?.data?.publicUrl;
        exists.image = data?.data?.results?.secure_url;
        await this.userprofile.save(exists);
      } else {
        const user = await this.userservice.findOneBy({
          id: data?.data?.meta?.userId,
        });
        const tosave = {
          createdBy: data.data.meta.userId,
          updatedBy: data.data.meta.userId,
          image: data.data.results.secure_url,
          public_id: data.data.publicUrl,
          user,
        };
        await this.userprofile.save(tosave);
      }
      this.events.emit(USER_EVENTS.REFETCH_USERS, {
        userId: data.data.meta.userId,
      });
      this.events.uploadComplete({
        progress: 100,
        filename: data.data.filename,
        meta: data.data.meta,
      });
      this.logger.log(
        `${data.data.meta.userId} : uploading profile image finished`,
      );
      this.eventslogger.logEvent(
        `Profile Picture Uploaded Successfully`,
        'user_events',
        { userId: data.data.meta.userId, eventType: 'PROFILE_UPLOAD' },
      );
    } catch (error) {
      this.logger.error(
        `${data.data.meta.userId} : uploading profile image Error: ${error.message}`,
      );
    }
  }
}

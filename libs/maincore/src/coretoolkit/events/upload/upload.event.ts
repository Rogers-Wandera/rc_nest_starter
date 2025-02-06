import { Injectable, Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { corsOptions } from '../../config/corsoptions';
import { EventsGateway } from '../event.gateway';

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
@WebSocketGateway({
  cors: corsOptions,
})
export class UploadEvents {
  private logger: Logger = new Logger();
  constructor(private readonly events: EventsGateway) {}

  @SubscribeMessage('upload_error')
  handleUpload(@MessageBody() data: UploadErrorType) {
    if (!data?.meta?.userId) {
      return;
    }
    const usersocket = this.events.getClients().get(data.meta.userId);
    if (usersocket) {
      usersocket.emit('upload_error', {
        error: data.error,
        filename: data.filename,
      });
    } else {
      this.logger.error(`User with id ${data.meta.userId} not connected`);
      this.logger.error(`Error: ${data.error} with filename: ${data.filename}`);
    }
  }

  @SubscribeMessage('upload_progress')
  handleUploadProgress(@MessageBody() data: UploadProgressType) {
    if (!data?.meta?.userId || !data?.filename) {
      return;
    }
    const usersocket = this.events.getClients().get(data.meta.userId);
    if (usersocket) {
      usersocket.emit('upload_progress', data);
    } else {
      this.logger.error(`User with id ${data.meta.userId} not connected`);
      this.logger.error(
        `Upload Progress: ${data.progress} with filename: ${data.filename}`,
      );
    }
  }
}

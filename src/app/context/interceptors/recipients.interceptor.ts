import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { RTechSystemNotificationType } from 'src/app/types/notification/notify.types';
import { DatabaseService } from 'src/db/database.provider';
import { User } from 'src/entity/core/users.entity';

@Injectable()
export class RecipientsValidator implements NestInterceptor {
  private logger = new Logger();
  constructor(
    @Inject('data_source') private readonly service: DatabaseService,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const repository = this.service.GetRepository(User);
    const websocket = context.switchToWs();
    const data: RTechSystemNotificationType = websocket.getData();
    if (data.recipient.type === 'broadcast') {
      return next.handle();
    }
    const recipients = data.recipient.recipients;
    const newrecipients: string[] = [];
    for (const recipient in recipients) {
      const user = await repository.findOne({
        where: { id: recipients[recipient] },
      });
      if (user) {
        newrecipients.push(user.id);
      } else {
        this.logger.warn(
          `User with recipient id of ${recipients[recipient]} does not exist`,
        );
      }
    }
    data.recipient.recipients = newrecipients;
    if (data.recipient.recipients.length <= 0) {
      this.logger.error(
        `Notification not sent, Reason: [Recipients array empty]`,
      );
      throw new WsException(`No recipients to send notification to`);
    }
    return next.handle();
  }
}

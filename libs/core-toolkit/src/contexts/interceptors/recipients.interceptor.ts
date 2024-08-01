import { DataBridgeService } from '@bridge/data-bridge';
import { User } from '@entity/entities/core/users.entity';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PRIORITY_TYPES } from '@toolkit/core-toolkit/types/enums/enums';
import { RTechSystemNotificationType } from '@toolkit/core-toolkit/types/notification/notify.types';

@Injectable()
export class RecipientsValidator implements NestInterceptor {
  private logger = new Logger();
  constructor(
    @Inject('data_source') private readonly service: DataBridgeService,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const repository = this.service.GetRepository(User);
    const websocket = context.switchToWs();
    const data: RTechSystemNotificationType = websocket.getData();
    if (data.recipient.type === 'broadcast') {
      return next.handle();
    }
    const recipients = data.recipient.recipients;
    const newrecipients: {
      to: string;
      priority?: PRIORITY_TYPES;
    }[] = [];
    for (const recipient in recipients) {
      const user = await repository.findOne({
        where: { id: recipients[recipient].to },
      });
      if (user) {
        newrecipients.push({
          to: user.id,
          priority: recipients[recipient].priority,
        });
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

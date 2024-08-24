import { DataBridgeService } from '../../../databridge/databridge.service';
import { User } from '../../../entities/core/users.entity';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PRIORITY_TYPES } from '../../types/enums/enums';
import { RTechSystemNotificationType } from '../../types/notification/notify.types';

/**
 * Interceptor that validates the recipients of a WebSocket notification.
 * It checks if recipients exist in the database and filters the list accordingly.
 */
@Injectable()
export class RecipientsValidator implements NestInterceptor {
  private logger = new Logger(RecipientsValidator.name);

  /**
   * Creates an instance of RecipientsValidator.
   * @param service - DataBridgeService instance used to access the data repository.
   */
  constructor(
    @Inject('data_source') private readonly service: DataBridgeService,
  ) {}

  /**
   * Intercepts the request, validates recipients, and modifies the notification data.
   * If recipients are invalid or empty, it throws a WebSocket exception.
   * @param context - ExecutionContext provides details about the current WebSocket request.
   * @param next - CallHandler to handle the request after validation.
   * @returns A Promise that resolves to the next handler or throws an exception if validation fails.
   */
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
          `User with recipient id of ${recipients[recipient].to} does not exist`,
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

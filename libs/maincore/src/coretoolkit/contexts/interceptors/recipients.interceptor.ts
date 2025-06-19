import { User } from '../../../entities/core/users.entity';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Notification } from '../../interfaces/notification.interface';
import { EntityDataSource } from '@core/maincore/databridge/model/enity.data.model';

/**
 * Interceptor that validates the recipients of a WebSocket notification.
 * It checks if recipients exist in the database and filters the list accordingly.
 */
@Injectable()
export class SocketRecipientsValidator implements NestInterceptor {
  private logger = new Logger(SocketRecipientsValidator.name);

  /**
   * Creates an instance of RecipientsValidator.
   * @param service - DataBridgeService instance used to access the data repository.
   */
  constructor(private readonly service: EntityDataSource) {}

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
    const data: Notification = websocket.getData();

    if (data.channel !== 'push') {
      return next.handle();
    }
    if (data.channel === 'push' && data.provider === 'firebase') {
      return next.handle();
    }

    const recipients = typeof data.to == 'string' ? [data.to] : data.to;
    const newrecipients: string[] = [];

    for (const recipient in recipients) {
      const user = await repository.findOne({
        where: { id: recipient },
      });
      if (user) {
        newrecipients.push(user.id);
      } else {
        this.logger.warn(
          `User with recipient id of ${recipient} does not exist`,
        );
      }
    }

    data.to = newrecipients;

    if (data.to.length <= 0) {
      this.logger.error(
        `Notification not sent, Reason: [Recipients array empty]`,
      );
      throw new WsException(`No recipients to send notification to`);
    }

    return next.handle();
  }
}

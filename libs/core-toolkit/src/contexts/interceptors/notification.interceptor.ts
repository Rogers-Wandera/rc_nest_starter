import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, map, mergeMap, throwError, timeout } from 'rxjs';
import { RabbitMQService } from '@toolkit/core-toolkit/micro/microservices/rabbitmq.service';
import {
  NOTIFICATION_KEY,
  NotificationTypes,
} from '@toolkit/core-toolkit/decorators/notification.decorator';
import { NOTIFICATION_PATTERN } from '@toolkit/core-toolkit/types/enums/enums';

/**
 * Interceptor for handling notifications in NestJS applications.
 * It sends a notification message to RabbitMQ before or after the main operation.
 */
@Injectable()
export class NotificationSender implements NestInterceptor {
  /**
   * Creates an instance of NotificationSender.
   * @param reflector - Reflector service to retrieve metadata.
   * @param client - RabbitMQService instance to send notification messages.
   */
  constructor(
    private reflector: Reflector,
    private readonly client: RabbitMQService,
  ) {}

  /**
   * Intercepts the request and sends a notification message to RabbitMQ.
   * The timing of sending the notification depends on the context configuration.
   * @param context - ExecutionContext provides details about the current request.
   * @param next - CallHandler to handle the request after processing.
   * @returns An Observable that either sends the notification before handling the request or after.
   */
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const notification = this.reflector.getAllAndOverride<NotificationTypes>(
      NOTIFICATION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!notification) {
      return next.handle();
    }
    if (notification.context === 'before') {
      return this.client
        .send(NOTIFICATION_PATTERN.NOTIFY, notification.data)
        .pipe(
          catchError((err: Record<string, any>) => {
            return throwError(() => new BadRequestException(err));
          }),
          timeout(40000),
          mergeMap(() => next.handle()),
        );
    } else {
      return next.handle().pipe(
        mergeMap((response) => {
          return this.client
            .send(NOTIFICATION_PATTERN.NOTIFY, notification.data)
            .pipe(
              catchError((err: Record<string, any>) => {
                return throwError(() => new BadRequestException(err));
              }),
              map(() => response),
              timeout(40000),
            );
        }),
      );
    }
  }
}

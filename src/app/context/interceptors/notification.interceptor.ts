import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, map, mergeMap, throwError, timeout } from 'rxjs';
import {
  NOTIFICATION_KEY,
  NotificationTypes,
} from 'src/app/decorators/notification.decorator';
import { NOTIFICATION_PATTERN } from 'src/app/patterns/notification.patterns';
import { RabbitMQService } from 'src/micro/microservices/rabbitmq.service';

@Injectable()
export class NotificationSender implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private readonly client: RabbitMQService,
  ) {}
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

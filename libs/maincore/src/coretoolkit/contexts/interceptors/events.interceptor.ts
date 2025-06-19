import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EVENT_KEY, UserEvent } from '../../decorators/event.decorator';
import { RabbitMQService } from '../../micro/microservices/rabbitmq.service';
import { RabbitMQQueues } from '../../types/enums/enums';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class EventsInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private rabbitMq: RabbitMQService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest() as Request;
    const response = context.switchToHttp().getResponse();
    const method = request.method.toLowerCase();
    const path = request.url;
    const user = request.user || { id: 'anonymous' };

    const eventConfig = this.reflector.getAllAndOverride<UserEvent>(EVENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!eventConfig) return next.handle();

    // Add dynamic metadata
    const eventData: UserEvent = {
      ...eventConfig,
      timestamp: new Date(),
      metadata: {
        ...eventConfig?.metadata,
        ip: request.ip,
        headers: user,
        method,
        requestPath: path,
      },
    };

    this.rabbitMq.setQueue(RabbitMQQueues.EVENTS);

    if (eventConfig.requestType === 'before') {
      if (eventConfig.notify?.length) {
        this.rabbitMq.emit(eventConfig.event, eventData);
      }
      return next.handle();
    } else {
      return next.handle().pipe(
        tap(() => {
          if (eventConfig.notify?.length) {
            const responseData = {
              statusCode: response.statusCode,
              eventData,
            };
            this.rabbitMq.emit(eventConfig.event, responseData);
          }
        }),
      );
    }
  }
}

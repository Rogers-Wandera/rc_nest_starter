import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EVENT_KEY, UserEvent } from '../../decorators/event.decorator';
import { RabbitMQService } from '../../micro/microservices/rabbitmq.service';

@Injectable({ scope: Scope.REQUEST })
export class EventsInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private rabbitMq: RabbitMQService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request: Request = context.switchToHttp().getRequest();
    const method = request.method.toLowerCase();
    const check = this.reflector.getAllAndOverride<UserEvent>(EVENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (check) {
    }
    return next.handle();
  }
}

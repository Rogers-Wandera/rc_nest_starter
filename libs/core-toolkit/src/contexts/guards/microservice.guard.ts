import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MICRO_SERVICE_KEY } from '@toolkit/core-toolkit/decorators/microservice.decorator';
import { RabbitMQService } from '@toolkit/core-toolkit/micro/microservices/rabbitmq.service';

@Injectable()
export class MicroServiceRunningGuard implements CanActivate {
  constructor(
    private readonly service: RabbitMQService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const microservice = this.reflector.getAllAndOverride<string>(
      MICRO_SERVICE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!microservice) {
      return true;
    }
    const isRunning = await this.service.ServiceCheck();
    if (!isRunning) {
      throw new ServiceUnavailableException(
        'The service is currently unavailable, please try again later.',
      );
    }
    return true;
  }
}

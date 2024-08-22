import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MICRO_SERVICE_KEY } from '@toolkit/core-toolkit/decorators/microservice.decorator';
import { RabbitMQService } from '@toolkit/core-toolkit/micro/microservices/rabbitmq.service';

/**
 * Guard that checks whether a microservice is running before allowing the request to proceed.
 * It uses the `RabbitMQService` to verify the availability of the microservice.
 *
 * @class MicroServiceRunningGuard
 * @implements {CanActivate}
 */
@Injectable()
export class MicroServiceRunningGuard implements CanActivate {
  /**
   * Creates an instance of `MicroServiceRunningGuard`.
   *
   * @param {RabbitMQService} service - Service to check the microservice availability.
   * @param {Reflector} reflector - Reflector to get metadata from the handler or class.
   */
  constructor(
    private readonly service: RabbitMQService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Determines if the request can be activated based on the availability of the microservice.
   *
   * @param {ExecutionContext} context - The execution context containing handler and class information.
   * @returns {Promise<boolean>} - `true` if the microservice is running, otherwise throws an exception.
   * @throws {ServiceUnavailableException} - If the microservice is not running, an exception is thrown.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
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

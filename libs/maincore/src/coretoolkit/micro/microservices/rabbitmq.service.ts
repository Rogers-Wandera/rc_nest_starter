import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_PATTERN } from '../../types/enums/enums';
import { catchError, lastValueFrom, of, timeout } from 'rxjs';

/**
 * Service for interacting with RabbitMQ for sending and emitting messages.
 * It provides methods to send and emit messages based on patterns and check the service health.
 *
 * @class RabbitMQService
 */
@Injectable()
export class RabbitMQService {
  /**
   * Creates an instance of `RabbitMQService`.
   *
   * @param {ClientProxy} client - Client to interact with RabbitMQ.
   */
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * Sends a message to the RabbitMQ service with the specified pattern and data.
   *
   * @param {NOTIFICATION_PATTERN} pattern The pattern to match for the message.
   * @param {any} data The data to be sent with the message.
   */
  public send(pattern: NOTIFICATION_PATTERN, data: any) {
    return this.client.send({ cmd: pattern }, data);
  }

  /**
   * Emits a message to the RabbitMQ service with the specified pattern and data.
   *
   * @param {NOTIFICATION_PATTERN} pattern - The pattern to match for the message.
   * @param {any} data - The data to be emitted with the message.
   */
  public emit(pattern: NOTIFICATION_PATTERN, data: any) {
    return this.client.emit({ cmd: pattern }, data);
  }

  /**
   * Checks if the RabbitMQ service is available by performing a health check.
   *
   * @returns {Promise<boolean>} - `true` if the service is healthy, otherwise `false`.
   */
  async ServiceCheck(): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.client.send({ cmd: 'HEALTHY_CHECK' }, 'Service').pipe(
          timeout(3000),
          catchError(() => of(false)),
        ),
      );
      return !!response;
    } catch {
      return false;
    }
  }
}

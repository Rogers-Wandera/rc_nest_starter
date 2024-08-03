import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_PATTERN } from '@toolkit/core-toolkit/types/enums/enums';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}
  public send(pattern: NOTIFICATION_PATTERN, data: any) {
    return this.client.send({ cmd: pattern }, data);
  }
  public emit(pattern: NOTIFICATION_PATTERN, data: any) {
    return this.client.emit({ cmd: pattern }, data);
  }
}

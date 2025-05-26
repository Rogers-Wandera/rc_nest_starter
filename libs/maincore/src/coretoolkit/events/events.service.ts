import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { corsOptions } from '../config/corsoptions';
import { EventsGateway } from './event.gateway';
import { RabbitMQService } from '../micro/microservices/rabbitmq.service';

/**
 * WebSocket gateway service for handling system notifications and login events.
 * Configured to work with Socket.IO and integrates with RabbitMQ for message handling.
 *
 * @class EventsGateWayService
 */
@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class EventsGateWayService {
  @WebSocketServer()
  server: Server;

  /**
   * Creates an instance of `EventsGateWayService`.
   *
   * @param {EventsGateway} events - Service for emitting events to clients.
   */
  constructor(
    private readonly events: EventsGateway,
    private readonly rmqService: RabbitMQService,
  ) {}

  // @SubscribeMessage('connected_back')
  // HandleConnectedBack() {
  //   if (this.events.getClients().size > 0) {
  //     this.events.getClients().forEach((_, key) => {
  //       this.rmqService.setQueue(RabbitMQQueues.NOTIFICATIONS);
  //       this.rmqService.emit(NOTIFICATION_PATTERN.USER_NOTIFICATIONS, {
  //         userId: key,
  //       });
  //     });
  //   }
  // }
}

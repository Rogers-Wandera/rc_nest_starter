import { Inject, Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { corsOptions } from '../config/corsoptions';
import { EventsGateway } from './event.gateway';

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
    @Inject('EventsGateway') private readonly events: EventsGateway,
  ) {}
}

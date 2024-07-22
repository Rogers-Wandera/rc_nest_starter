import { Inject, Injectable } from '@nestjs/common';
import {
  Message,
  MessagingPayload,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import { FireBaseService } from 'src/db/firebase.setup';
import { EventsGateway } from 'src/events/event.gateway';
import { RTechSystemNotificationType } from '../types/notify.types';

@Injectable()
export class RTECHPushNotificationService {
  constructor(
    @Inject('FIREBASE_SERVICE') private readonly firebase: FireBaseService,
    @Inject('EventsGateway') private readonly eventservice: EventsGateway,
  ) {}
  public sendMessage(message: Message) {
    return this.firebase.admin.messaging().send(message);
  }
  public sendToTopic(topic: string, message: MessagingPayload) {
    return this.firebase.admin.messaging().sendToTopic(topic, message);
  }
  public sendMultiCast(message: MulticastMessage) {
    return this.firebase.admin.messaging().sendEachForMulticast(message);
  }

  public async sendSystemNotification(data: RTechSystemNotificationType) {
    return this.eventservice.server.emit('notification', data);
  }
}

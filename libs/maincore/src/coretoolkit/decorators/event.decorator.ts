import { SetMetadata } from '@nestjs/common';
import { EVENTS_PATTERN } from '../types/enums/enums';
export type NotificationChannel = ('email' | 'sms' | 'push')[];
export type REQUEST_TYPE = 'before' | 'after' | 'both';

export type UserEvent = {
  name: string;
  description: string;
  type?: 'AUTH' | 'PROFILE' | 'ORDER' | 'GENERAL';
  event?: EVENTS_PATTERN;
  timestamp?: Date;
  requestType?: REQUEST_TYPE;
  metadata?: Record<string, any>;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  notify?: NotificationChannel;
};

export const EVENT_KEY = 'EVENT_KEY';

export const EventSaver = (event: UserEvent) =>
  SetMetadata(EVENT_KEY, {
    timestamp: new Date(),
    severity: 'INFO',
    requestType: 'after',
    notify: [],
    event: EVENTS_PATTERN.USER_EVENTS,
    ...event,
  });

import { SetMetadata } from '@nestjs/common';
import { NotifyTypes } from '../types/notification/notify.types';

export const NOTIFICATION_KEY = 'NOTIFICATION_KEY';

export type NotificationTypes = {
  context: 'before' | 'after';
  data: NotifyTypes;
};

export const Notification = (data: NotificationTypes) =>
  SetMetadata(NOTIFICATION_KEY, data);

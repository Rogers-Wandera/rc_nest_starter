import { SetMetadata } from '@nestjs/common';
import { Notification } from '../interfaces/notification.interface';

export const NOTIFICATION_KEY = 'NOTIFICATION_KEY';

export type NotificationTypes = {
  context: 'before' | 'after';
  data: Notification;
};

/**
 * Decorator to configure notification behavior for a method or class.
 * This sets metadata to specify when and how a notification should be sent in relation to the method execution.
 *
 * @param data - An object that includes the notification context (`'before'` or `'after'`) and the data to be sent as the notification.
 *
 * @see {@link Notification} for the structure of the notification data.
 */
export const SendNotification = (data: NotificationTypes) =>
  SetMetadata(NOTIFICATION_KEY, data);

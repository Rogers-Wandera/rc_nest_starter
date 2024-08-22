import { SetMetadata } from '@nestjs/common';
import { NotifyTypes } from '../types/notification/notify.types';

export const NOTIFICATION_KEY = 'NOTIFICATION_KEY';

export type NotificationTypes = {
  context: 'before' | 'after';
  data: NotifyTypes;
};

/**
 * Decorator to configure notification behavior for a method or class.
 * This sets metadata to specify when and how a notification should be sent in relation to the method execution.
 *
 * @param data - An object that includes the notification context (`'before'` or `'after'`) and the data to be sent as the notification.
 *
 * @example
 * ```typescript
 * @Notification({
 *   context: 'before',
 *   data: {
 *     message: 'Notification message',
 *     type: 'email',
 *   },
 * })
 * export class SomeClass {}
 * ```
 *
 * @see {@link NotifyTypes} for the structure of the notification data.
 */
export const Notification = (data: NotificationTypes) =>
  SetMetadata(NOTIFICATION_KEY, data);

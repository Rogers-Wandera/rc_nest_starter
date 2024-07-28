import { ISendMailOptions } from '@nestjs-modules/mailer';
import {
  Message,
  MessagingPayload,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import { EmailContent } from './mailer.types';
import { NOTIFICATION_PATTERN } from 'src/app/patterns/notification.patterns';
import { NotificationTypes } from '../enums/notifyresponse.enum';
import { PRIORITY_TYPES } from 'src/app/app.types';

type mediaTypes = {
  type: 'image' | 'video' | 'audio';
  imageUrl: string;
};

export type SystemNotificationData = {
  title: string;
  message: string;
  timestamp: Date;
  mediaUrl?: mediaTypes[];
  meta?: Record<string, string | number | Date | Boolean>;
};

export type NotificationTags = { name: string; link?: string };
type NotificationRecipient =
  | { type: 'broadcast' }
  | { type: 'no broadcast'; recipients: string[] };

export type RTechSystemNotificationType = {
  pattern: NOTIFICATION_PATTERN;
  priority: PRIORITY_TYPES;
  type: NotificationTypes;
  data: SystemNotificationData;
  recipient: NotificationRecipient;
  tags?: NotificationTags;
  link?: string;
};

type payLoadWithNoTopic = {
  type: 'topic';
  payload: MessagingPayload;
};

type payLoadWithTopic = {
  type: 'notopic';
  payload: Message;
};
type payLoadMultiCast = {
  type: 'multicast';
  payload: MulticastMessage;
};

type payLoadSystem = {
  type: 'system';
  payload: RTechSystemNotificationType;
};
type PushOptionsBase =
  | payLoadWithNoTopic
  | payLoadWithTopic
  | payLoadMultiCast
  | payLoadSystem;

// type PushOptionsWithTopic = PushOptionsBase & {
//   type: 'topic';
//   topic: string;
// };

// type PushOptionsWithoutTopic = PushOptionsBase & {
//   type: 'notopic' | 'multicast' | 'system';
// };

// export type PushTypes = PushOptionsWithTopic | PushOptionsWithoutTopic;

export type PushTypes = PushOptionsBase;

export type SmsMessage = {
  body: string;
  to: string | string[];
  sender?: string;
};

export type EmailOptions = {
  type: 'email';
  payload: Omit<Omit<ISendMailOptions, 'template'>, 'content'> &
    EmailContent & {
      company?: string;
    };
};

export type SmsPayload = {
  provider: 'twilio' | 'pahappa';
  message: SmsMessage;
  company?: string;
};
export type SmsOptions = {
  type: 'sms';
  payload: SmsPayload;
};

export type PushOptions = {
  type: 'push';
  payload: PushTypes & { company?: string };
};

export type NotifyTypes = EmailOptions | SmsOptions | PushOptions;

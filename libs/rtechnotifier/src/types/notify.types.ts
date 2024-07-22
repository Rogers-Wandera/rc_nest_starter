import {
  Message,
  MessagingPayload,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';

export type RTechSystemNotificationType = {
  data: Record<string, any>;
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

type PushOptionsWithTopic = PushOptionsBase & {
  type: 'topic';
  topic: string;
};

type PushOptionsWithoutTopic = PushOptionsBase & {
  type: 'notopic' | 'multicast' | 'system';
};

export type PushOptions = PushOptionsWithTopic | PushOptionsWithoutTopic;

export type RTechSmsMessage = {
  body: string;
  to: string;
  sender?: string;
};
export type RTechSmsTypes = 'twilio' | 'pahappa';

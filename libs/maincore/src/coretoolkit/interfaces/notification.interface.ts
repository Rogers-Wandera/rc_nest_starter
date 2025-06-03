import { MailerOptions } from '@nestjs-modules/mailer';
import {
  AndroidConfig,
  ApnsConfig,
  ApnsPayload,
  WebpushConfig,
} from 'firebase-admin/lib/messaging/messaging-api';
import { EmailTemplates, PushTemplates } from './templates.interface';

export type AttachmentType =
  | 'image'
  | 'video'
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'audio'
  | 'text'
  | 'other';

export type Attachment = {
  id: string;
  name: string;
  type: AttachmentType;
  url: string;
  size: number;
  mimeType: string;
  downloadable: boolean;
  uploadedAt: Date;
  uploadedBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  meta?: Record<string, any>;
};

export type EmailNotification = {
  channel: 'email';
  provider: 'nodemailer';
  template?: EmailTemplates;
  options?: Omit<
    MailerOptions,
    'template' | 'from' | 'subject' | 'html' | 'context' | 'body' | 'to'
  >;
  attachments?: Attachment[];
};

export enum EmailProviders {
  NODEMAILER = 'nodemailer',
}

export enum SmsProviders {
  TWILIO = 'twilio',
  PAHAPPA = 'pahappa',
}

export enum PushProviders {
  FIREBASE = 'firebase',
  SOCKET = 'socket',
}

export type FirebaseNotification = {
  provider: 'firebase';
  options?: {
    fcm?:
      | { type: 'topic'; topic: string }
      | { type: 'condition'; condition: string };
    imageUrl?: string;
    androidChannelId?: string;
    androidIcon?: string;
    androidColor?: string;
    iosSound?: string;
    iosBadge?: number;
    ApnsPayload?: ApnsPayload;
    ApnsConfig?: ApnsConfig;
    WebpushConfig?: WebpushConfig;
    AndroidConfig?: AndroidConfig;
  };
};

export type SocketNotification = {
  provider: 'socket';
  options?: { event?: string; [key: string]: any };
  template?: PushTemplates;
  attachments?: Attachment[];
  coverImage?: string;
};

export type PushNotification = {
  channel: 'push';
} & (SocketNotification | FirebaseNotification);

export type SmsNotification = {
  channel: 'sms';
} & (
  | { provider: 'twilio'; options?: Record<string, any> }
  | { provider: 'pahappa'; options?: Record<string, any> }
);

export enum Priority {
  LOW = 'low',
  HIGH = 'high',
  NORMAL = 'normal',
}

export enum Channel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
}

export enum AlertType {
  SYSTEM = 'system',
  ERROR = 'error',
  WARNING = 'warning',
  SECURITY = 'security',
  NETWORK = 'network',
  PERFORMANCE = 'performance',
  MAINTENANCE = 'maintenance',
  CUSTOM = 'custom',
  ANNOUCEMENT = 'announcement',
}

export type Notification = {
  id?: string;
  to: string | string[];
  from: string;
  subject: string;
  body: string;
  avatar?: {
    name: string;
    avatar?: string;
  };
  data?: Record<string, any>;
  alertType?: AlertType;
  priority?: Priority;
  scheduledAt?: Date;
  metadata?: {
    userId?: string;
    eventType?: string;
    maxRetries?: number;
    [key: string]: any;
  };
} & (EmailNotification | PushNotification | SmsNotification);

export enum NotificationStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  PARTIAL = 'partial',
  PROCESSING = 'processing',
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}
// result.interface.ts
export interface NotificationResult {
  status: NotificationStatus;
  messageId?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamps: {
    queuedAt?: Date;
    sentAt?: Date;
    deliveredAt?: Date;
  };
  providerMetadata?: Record<string, any>;
}

export interface SuccessEvent {
  type: 'complete';
  data: {
    notificationId: string;
    status: NotificationStatus;
    results: NotificationResult[];
  };
}
export interface ProgressEvent {
  type: 'progress';
  data: NotificationResult;
}

export type NotificationEvent = SuccessEvent | ProgressEvent;

export type ExtractNotificationByChannel<
  T extends { [K in D]: string },
  D extends keyof T,
  V extends T[D],
> = T extends Record<D, V> ? T : never;

export type EmailNotificationType = ExtractNotificationByChannel<
  Notification,
  'channel',
  'email'
>;

export type SmsNotificationType = ExtractNotificationByChannel<
  Notification,
  'channel',
  'sms'
>;

export type PushNotificationType = ExtractNotificationByChannel<
  Notification,
  'channel',
  'push'
>;

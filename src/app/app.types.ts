export type Paramstype = 'body' | 'params' | 'query';

export enum NOTIFICATION_TYPE {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
  PUSH_SYSTEM = 'push_system',
}

export enum NOTIFICATION_STATUS {
  SENT = 'sent',
  RECIEVED = 'recieved',
  READ = 'read',
  FAILED = 'failed',
}

export enum NOTIFICATION_RESEND_STATUS {
  RESCHEDULED = 'rescheduled',
  SENT = 'sent',
  PENDING = 'pending',
}
export enum PRIORITY_TYPES {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum NotificationDeliveryTypes {
  SMS_DELIVERY = 'sms delivery',
  EMAIL_DELIVERY = 'email delivery',
  PUSH_DELIVERY = 'push delivery',
}

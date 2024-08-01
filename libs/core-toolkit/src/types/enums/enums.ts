export enum PRIORITY_TYPES {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum NOTIFICATION_PATTERN {
  NOTIFY = 'notify',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  SYSTEM_NOTIFICATION_SENT = 'SYSTEM_NOTIFICATION_SENT',
  ANNOUNCEMENTS = 'announcements',
  LOGIN = 'login',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  RESEND = 'RESEND',
}

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

export enum NotificationDeliveryTypes {
  SMS_DELIVERY = 'sms_delivery',
  EMAIL_DELIVERY = 'email_delivery',
  PUSH_DELIVERY = 'push_delivery',
}

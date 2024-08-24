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
  HEALTHY_CHECK = 'HEALTHY_CHECK',
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

export enum NotifyResponse {
  EMAIL = 'Email sent successfully',
  PUSH = 'Push Notification sent successfully',
  SMS_SUCCESS = 'Sms sent successfully',
  SMS_FAILURE = 'Failed to send to number',
}

export enum NotificationTypes {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  CUSTOM = 'custom',
}

export enum MediaTypes {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}
export enum ROLE {
  ADMIN = 5150,
  USER = 2001,
  PROGRAMMER = 1982,
  EDITOR = 1845,
}

export enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  PUT = 'PUT',
  OPTIONS = 'OPTIONS',
}

export enum EmailTemplates {
  VERIFY_EMAIL = 'verify',
  MAILER_2 = 'mailer2',
}

export enum GUARDS {
  JWT = 'JWT',
  EMAIL = 'EMAIL',
  REFRESH = 'REFRESH',
  ROLES = 'ROLES',
}

export enum TOKEN_TYPES {
  RESET = 'reset',
  VERIFY = 'verify',
}

export enum UserGroupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

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

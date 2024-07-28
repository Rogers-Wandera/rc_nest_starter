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

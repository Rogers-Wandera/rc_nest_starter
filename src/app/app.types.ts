export type Paramstype = 'body' | 'params' | 'query';
export enum NOTIFICATION_TYPE {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
}

export enum NOTIFICATION_STATUS {
  SENT = 'sent',
  RECIEVED = 'recieved',
  READ = 'read',
  FAILED = 'failed',
}

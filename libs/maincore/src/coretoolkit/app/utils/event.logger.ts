import { Injectable, Logger, Scope } from '@nestjs/common';
import { LoggerService } from './logger.app';
import { format } from 'date-fns';

export interface LogEvent {
  eventType: string;
  type?: 'info' | 'error' | 'warn';
  userId?: string;
  data?: Record<string, any>;
}

@Injectable({ scope: Scope.TRANSIENT })
export class EventLogger {
  private logger = new LoggerService();
  private nestLogger = new Logger(EventLogger.name);
  private folder = 'events';
  constructor() {}
  logEvent(message: string, filename: string, event: LogEvent) {
    const type = event?.type || 'info';
    const file = filename.startsWith('/') ? filename.slice(1) : filename;
    this.folder = `${this.folder}/${file}`;
    this.folder = `${this.folder.endsWith('.md') ? this.folder : this.folder.replace(/\.[^/.]+$/, '') + '.md'}`;
    const formatted = this.formatLog(event);
    switch (type) {
      case 'info':
        this.logger.log(message, this.folder, formatted);
        break;
      case 'error':
        this.logger.error(message, this.folder, formatted);
        break;
      case 'warn':
        this.logger.warn(message, this.folder, formatted);
        break;
      default:
        this.nestLogger.error(`Unknown Type ${event.type}`);
        break;
    }
    this.folder = `events`;
  }

  private formatLog(event: LogEvent) {
    return {
      eventType: event.eventType,
      userId: event?.userId || 'N/A',
      data: event?.data || {},
      timeStamp: format(new Date(), 'yyyy-MM-dd H:i:s'),
    };
  }
}

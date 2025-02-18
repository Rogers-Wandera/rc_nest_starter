import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class LoggerService {
  private logDirectory: string;

  constructor() {
    this.logDirectory = join(process.cwd(), 'logs');
    if (!existsSync(this.logDirectory)) {
      mkdirSync(this.logDirectory);
    }
  }

  private getLogger(fileName: string): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const structuredMessage = JSON.stringify({
            logDate: timestamp,
            level,
            message,
            ...meta,
          });
          return structuredMessage;
        }),
      ),
      transports: [
        // Console transport for colorized output
        // new winston.transports.Console({
        //   format: winston.format.combine(
        //     winston.format.colorize(),
        //     winston.format.printf(({ timestamp, level, message, ...meta }) => {
        //       const logMessage = `${timestamp} ${level}: ${message}`;
        //       return logMessage;
        //     }),
        //   ),
        // }),
        // Daily Rotate File transport for structured JSON logs
        new winston.transports.DailyRotateFile({
          filename: join(
            this.logDirectory,
            this.addDatePatternToFilename(fileName),
          ),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d', // Keeps logs for 14 days
        }),
      ],
    });
  }

  log(message: string, fileName: string = '%DATE%.log', metadata: any = {}) {
    const logger = this.getLogger(fileName);
    logger.info(message, metadata);
  }

  error(message: string, fileName: string = '%DATE%.log', metadata: any = {}) {
    const logger = this.getLogger(fileName);
    logger.error(message, metadata);
  }

  warn(message: string, fileName: string = '%DATE%.log', metadata: any = {}) {
    const logger = this.getLogger(fileName);
    logger.warn(message, metadata);
  }

  debug(message: string, fileName: string = '%DATE%.log', metadata: any = {}) {
    const logger = this.getLogger(fileName);
    logger.debug(message, metadata);
  }

  verbose(
    message: string,
    fileName: string = '%DATE%.log',
    metadata: any = {},
  ) {
    const logger = this.getLogger(fileName);
    logger.verbose(message, metadata);
  }

  private addDatePatternToFilename(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex !== -1) {
      // Insert %DATE% before the file extension
      return (
        filename.slice(0, lastDotIndex) +
        '-%DATE%' +
        filename.slice(lastDotIndex)
      );
    } else {
      // No extension found, just append %DATE%
      return filename + '-%DATE%';
    }
  }
}

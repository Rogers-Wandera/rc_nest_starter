import { format, isBefore, parse } from 'date-fns';
import { CustomAppError } from '../context/app.error';
import CryptoJs from 'crypto-js';
import { readFileSync } from 'fs';
import ejs from 'ejs';
import { sendEmail } from '../mailer/mailer';
import * as path from 'path';
import { Server } from 'socket.io';
import { EventsGateway } from 'src/events/event.gateway';
import { Inject, Injectable } from '@nestjs/common';

const directory = path.join(__dirname, '..', 'templates', 'mailtemp.ejs');

@Injectable()
export class Utilities {
  protected socket: Server;
  constructor(
    @Inject(EventsGateway) private readonly eventsGateway: EventsGateway,
  ) {
    this.socket = this.eventsGateway.server;
  }

  public emit(event: string, data: unknown) {
    this.socket.emit(event, data);
  }
  public encryptData(input: string): string {
    try {
      const secretKey = process.env.ENCRYPTION_KEY;
      const cipherInput = CryptoJs.AES.encrypt(input, secretKey).toString();
      return cipherInput;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
    }
  }

  public decryptData(encrypted: string): string {
    try {
      const secretKey = process.env.ENCRYPTION_KEY;
      const bytes = CryptoJs.AES.decrypt(encrypted, secretKey);
      const ciphedInput = bytes.toString(CryptoJs.enc.Utf8);
      return ciphedInput;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
    }
  }

  public checkExpireDate(date: string): boolean {
    try {
      const newdate = new Date(date);
      const fm = format(newdate, 'yyyy-MM-dd HH:mm:ss');
      const parsedDate = parse(fm, 'yyyy-MM-dd HH:mm:ss', new Date());
      const currentDate = new Date();
      return isBefore(parsedDate, currentDate);
    } catch (error) {
      throw new CustomAppError(error.message, 400);
    }
  }

  public SendEmailLink = async (
    email: string,
    subject: string,
    emailData: object,
  ) => {
    try {
      const template = readFileSync(directory, 'utf-8');
      const emailHtml = ejs.render(template, emailData);
      const response = await sendEmail(email, subject, emailHtml);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };
}

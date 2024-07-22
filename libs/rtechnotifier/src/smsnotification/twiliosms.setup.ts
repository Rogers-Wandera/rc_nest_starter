import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import client, { Twilio } from 'twilio';
import { EnvConfig, twilioconfig } from '../configs/config';
import { RTechSmsMessage } from '../types/notify.types';

@Injectable()
export class TwilioSMSService {
  private twilio: Twilio;
  constructor(private readonly configService: ConfigService<EnvConfig>) {
    this.twilio = client(
      configService.get<twilioconfig>('twilio').accountSid,
      configService.get<twilioconfig>('twilio').authToken,
    );
  }
  async sendMessage(message: RTechSmsMessage) {
    const response = await this.twilio.messages.create({
      from: this.configService.get<twilioconfig>('twilio').number,
      to: message.to,
      body: message.body,
    });
    return response;
  }
}

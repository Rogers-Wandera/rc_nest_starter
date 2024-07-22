import { BadRequestException, Injectable } from '@nestjs/common';
import { RTechSmsMessage, RTechSmsTypes } from '../types/notify.types';
import { TwilioSMSService } from './twiliosms.setup';
import { PahappaSMSService } from './pahappasms.setup';

@Injectable()
export class RTechSmsService {
  public type: RTechSmsTypes;
  constructor(
    private readonly twilioservice: TwilioSMSService,
    private readonly pahappaservice: PahappaSMSService,
  ) {
    this.type = 'twilio';
  }
  private validatePhoneNumber(phoneNumber: string) {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phoneNumber);
  }
  async sendMessage(message: RTechSmsMessage) {
    if (!message) {
      throw new BadRequestException('Please provide message');
    }
    if (!this.validatePhoneNumber(message.to))
      throw new BadRequestException(
        'Please provide a valid phone number e.g +256------',
      );
    switch (this.type) {
      case 'twilio':
        return await this.twilioservice.sendMessage(message);
      case 'pahappa':
        return await this.pahappaservice.sendMessage(message);
      default:
        throw new BadRequestException(
          'The sms service is not supported at the moment',
        );
    }
  }
}

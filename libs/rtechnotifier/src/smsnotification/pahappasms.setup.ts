import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig, pahappaconfig } from '../configs/config';
import { RTechSmsMessage } from '../types/notify.types';
import axios from 'axios';

type response = 'OK';

@Injectable()
export class PahappaSMSService {
  private readonly url: string;
  constructor(private readonly configService: ConfigService<EnvConfig>) {
    this.url = `https://www.egosms.co/api/v1/plain/`;
  }
  async sendMessage(message: RTechSmsMessage) {
    const response = await axios.get<response>(this.url, {
      params: {
        username: this.configService.get<pahappaconfig>('pahappa').username,
        password: this.configService.get<pahappaconfig>('pahappa').password,
        number: message.to,
        message: message.body,
        sender: message.sender || 'RTech',
      },
    });
    if (response.data !== 'OK') {
      throw new BadRequestException(response.data);
    }
    return response.data;
  }
}

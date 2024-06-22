import { format, isBefore, parse } from 'date-fns';
import { CustomAppError } from '../context/app.error';
import CryptoJs from 'crypto-js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Utilities {
  constructor() {}
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

  public checkExpireDate(date: string | Date): boolean {
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

  public encryptUrl(input: string) {
    return encodeURIComponent(this.encryptData(input));
  }
  public decryptUrl(decrypted: string) {
    return decodeURIComponent(this.decryptData(decrypted));
  }
}

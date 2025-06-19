import { Injectable } from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces';

@Injectable()
export class ApplicationContext {
  public app: INestApplication;
}

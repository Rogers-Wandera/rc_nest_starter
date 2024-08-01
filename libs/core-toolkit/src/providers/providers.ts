import { Provider } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AsyncLocalStorage } from 'async_hooks';
import { AllExceptionsFilter } from '../contexts/exceptions/http-exception.filter';
import { DecryptData } from '../contexts/interceptors/decrypt.interceptor';
import { TransformPainateQuery } from '../contexts/interceptors/jsonparser.interceptor';
import {
  JoiPaginateValidation,
  JoiSchemaValidator,
} from '../contexts/interceptors/joi.interceptor';
import { ServiceValidator } from '../contexts/interceptors/servicevalidator.interceptor';
import { NotificationSender } from '../contexts/interceptors/notification.interceptor';

export const CoreAppProviders: Provider[] = [
  {
    provide: AsyncLocalStorage,
    useValue: new AsyncLocalStorage(),
  },
  { provide: APP_GUARD, useClass: ThrottlerGuard },
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: DecryptData,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: TransformPainateQuery,
  },
  { provide: APP_INTERCEPTOR, useClass: JoiPaginateValidation },
  { provide: APP_INTERCEPTOR, useClass: ServiceValidator },
  { provide: APP_INTERCEPTOR, useClass: JoiSchemaValidator },
  { provide: APP_INTERCEPTOR, useClass: NotificationSender },
];

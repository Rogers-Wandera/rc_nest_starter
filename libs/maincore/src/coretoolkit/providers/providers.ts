import { Provider, Scope } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
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
import { MicroServiceRunningGuard } from '../contexts/guards/microservice.guard';
import { ClassValidationPipe } from '../contexts/pipes/classvalidator.pipe';
import { ClassValidatorInterceptor } from '../contexts/interceptors/classvalidator.interceptor';
import { EventsInterceptor } from '../contexts/interceptors/events.interceptor';
import { CustomThrottlerGuard } from '../contexts/guards/rate.limiter.gaurd';

export const CoreAppProviders: Provider[] = [
  {
    provide: AsyncLocalStorage,
    useValue: new AsyncLocalStorage(),
  },
  { provide: APP_GUARD, useClass: MicroServiceRunningGuard },
  {
    provide: APP_GUARD,
    useClass: CustomThrottlerGuard,
  },
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: DecryptData,
    scope: Scope.TRANSIENT,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: TransformPainateQuery,
    scope: Scope.TRANSIENT,
  },
  // { provide: APP_PIPE, useClass: ClassValidationPipe, scope: Scope.TRANSIENT },
  {
    provide: APP_INTERCEPTOR,
    useClass: ClassValidatorInterceptor,
    scope: Scope.TRANSIENT,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: JoiPaginateValidation,
    scope: Scope.TRANSIENT,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: JoiSchemaValidator,
    scope: Scope.TRANSIENT,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ServiceValidator,
    scope: Scope.TRANSIENT,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: NotificationSender,
    scope: Scope.TRANSIENT,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: EventsInterceptor,
    scope: Scope.TRANSIENT,
  },
];

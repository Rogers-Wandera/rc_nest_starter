// timeout.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { TIMEOUT_METADATA_KEY } from '../../decorators/timeout.decorator';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout: number;

  constructor(private reflector: Reflector) {
    this.defaultTimeout = 15000; // 15 seconds
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const customTimeout = this.reflector.get<number | null>(
      TIMEOUT_METADATA_KEY,
      context.getHandler(),
    );

    // If timeout is 0, skip timeout entirely
    if (customTimeout === 0 || customTimeout === null) {
      return next.handle();
    }

    // Use custom timeout if defined, else fallback to default
    const timeoutValue = customTimeout ?? this.defaultTimeout;

    return next.handle().pipe(
      timeout(timeoutValue),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException();
        }
        return throwError(() => err);
      }),
    );
  }
}

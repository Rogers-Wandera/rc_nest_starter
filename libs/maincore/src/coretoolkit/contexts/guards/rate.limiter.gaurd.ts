import { ThrottlerGuard } from '@nestjs/throttler';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    if (req.user && req.user.id) {
      return req.user.id;
    }
    return req.ips.length ? req.ips[0] : req.ip;
  }

  protected async throwThrottlingException(): Promise<void> {
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Request limit exceeded. Please try again later.',
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  protected errorMessage = 'Rate limit exceeded. Please try again later.';
}

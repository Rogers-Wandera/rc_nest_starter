import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { CustomAppError } from '../app.error';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      stack: exception.stack,
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal Server Error';
    let stackTrace = '';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      errorMessage = exception.message;
      stackTrace = exception.stack;
    } else if (exception instanceof CustomAppError) {
      httpStatus = exception.errorCode || HttpStatus.BAD_REQUEST; // Adjust as per your CustomAppError structure
      errorMessage = exception.message || 'Custom Error Message';
      stackTrace = exception.stack || '';
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      stackTrace = exception.stack || '';
    } else if (typeof exception === 'string') {
      errorMessage = exception;
    }

    const errorResponse = {
      statusCode: httpStatus,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: errorMessage,
      stack: stackTrace,
    };

    response.status(httpStatus).json(errorResponse);
  }
}

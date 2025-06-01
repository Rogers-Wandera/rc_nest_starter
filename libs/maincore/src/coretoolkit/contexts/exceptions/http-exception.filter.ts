import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import e, { Request, Response } from 'express';

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

    if (exception instanceof NotFoundException) {
      if (exception.message.toLowerCase().startsWith('cannot')) {
        errorMessage = 'Resource not found';
      } else {
        errorMessage = exception.message;
      }
      httpStatus = exception.getStatus();
      stackTrace = exception.stack;
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      errorMessage = exception.message;
      stackTrace = exception.stack;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      stackTrace = exception.stack || '';
    } else if (typeof exception === 'string') {
      errorMessage = exception;
    } else if (exception instanceof RpcException) {
      errorMessage = exception.message;
      stackTrace = exception.stack || '';
    } else if (typeof exception === 'object') {
      errorMessage =
        exception['message'] || exception['error'] || 'Internal Server Error';
      stackTrace = exception['stack'] || '';
      httpStatus = exception['statusCode'] || HttpStatus.INTERNAL_SERVER_ERROR;
    }
    console.error(errorMessage);

    const errorResponse = {
      statusCode: httpStatus,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: errorMessage,
      stack: stackTrace,
      original: exception,
    };

    response.status(httpStatus).json(errorResponse);
  }
}

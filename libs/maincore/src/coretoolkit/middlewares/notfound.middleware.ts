import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NotFoundMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const errorResponse = {
      statusCode: 404,
      path: req.url,
      timestamp: new Date().toISOString(),
      message: "The requested resource couldn't be found",
      stack: null,
    };
    res.status(404).json(errorResponse);
  }
}

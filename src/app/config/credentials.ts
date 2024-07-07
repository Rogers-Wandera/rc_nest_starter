import { NextFunction, Request, Response } from 'express';
import { allowedOrigins } from './allowedorigins';

export const credentials = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials');
  }
  next();
};

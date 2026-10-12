import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,

  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  
  console.error('💥 UNEXPECTED ERROR:', err);

  const statusCode = 500;
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
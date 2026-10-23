/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken, TokenPayload } from '../utils/token.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/app-error.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;


    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    let decoded: TokenPayload;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError('Your session has expired. Please log in again.', 401);
      }
      throw new AppError('Invalid authentication token.', 401);
    }

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
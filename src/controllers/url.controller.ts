import { Request, Response, NextFunction } from 'express';
import { UrlService } from '../services/url.service.js';
import { AppError } from '../utils/app-error.js';

export class UrlController {
  public static async createUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { originalUrl } = req.body;
      const url = await UrlService.createUrl(originalUrl, req.user._id);

      res.status(201).json({
        status: 'success',
        message: 'Short URL created successfully',
        data: {
          url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
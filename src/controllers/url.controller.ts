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

  public static async getUserUrls(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const urls = await UrlService.getUserUrls(req.user._id);

      res.status(200).json({
        status: 'success',
        results: urls.length,
        data: {
          urls,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getUrlById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        throw new AppError('URL ID is required', 400);
      }

      const url = await UrlService.getUrlById(id, req.user._id);

      res.status(200).json({
        status: 'success',
        data: {
          url,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        throw new AppError('URL ID is required', 400);
      }

      await UrlService.deleteUrl(id, req.user._id);

      res.status(200).json({
        status: 'success',
        message: 'URL deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async redirectUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shortCode = Array.isArray(req.params.shortCode)
        ? req.params.shortCode[0]
        : req.params.shortCode;

      if (!shortCode) {
        throw new AppError('Short code is required', 400);
      }

      const originalUrl = await UrlService.getOriginalUrlAndTrackClick(shortCode);

      
      res.redirect(302, originalUrl);
    } catch (error) {
      next(error);
    }
  }
}
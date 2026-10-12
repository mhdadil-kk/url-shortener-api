import { Types } from 'mongoose';
import { Url, IUrlDocument } from '../models/url.model.js';
import { generateShortCode } from '../utils/nanoid.js';
import { AppError } from '../utils/app-error.js';

export class UrlService {
  private static readonly MAX_COLLISION_RETRIES = 5;


  public static async createUrl(originalUrl: string, userId: Types.ObjectId): Promise<IUrlDocument> {
    let attempts = 0;

    while (attempts < this.MAX_COLLISION_RETRIES) {
      const shortCode = generateShortCode(7);

      try {
        const newUrl = await Url.create({
          originalUrl,
          shortCode,
          userId,
        });

        return newUrl;
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code: number }).code === 11000
        ) {
          attempts++;
          continue;
        }
        throw error;
      }
    }

    
    throw new AppError('Unable to generate unique short code. Please try again.', 500);
  }

    public static async getUserUrls(userId: Types.ObjectId): Promise<IUrlDocument[]> {
    return Url.find({ userId }).sort({ createdAt: -1 });
  }

  public static async getUrlById(urlId: string, userId: Types.ObjectId): Promise<IUrlDocument> {
    if (!Types.ObjectId.isValid(urlId)) {
      throw new AppError('Invalid URL ID format', 400);
    }
    const url = await Url.findById(urlId);
    if (!url) {
      throw new AppError('URL record not found', 404);
    }
    if (!url.userId.equals(userId)) {
      throw new AppError('Forbidden: You do not have permission to view this resource', 403);
    }
    return url;
  }

  public static async deleteUrl(urlId: string, userId: Types.ObjectId): Promise<void> {
    if (!Types.ObjectId.isValid(urlId)) {
      throw new AppError('Invalid URL ID format', 400);
    }
    const url = await Url.findById(urlId);
    if (!url) {
      throw new AppError('URL record not found', 404);
    }
    if (!url.userId.equals(userId)) {
      throw new AppError('Forbidden: You do not have permission to delete this resource', 403);
    }
    await Url.findByIdAndDelete(urlId);
  }

  public static async getOriginalUrlAndTrackClick(shortCode: string): Promise<string> {
    const url = await Url.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!url) {
      throw new AppError('Short URL not found or has expired', 404);
    }
    return url.originalUrl;
  }
}
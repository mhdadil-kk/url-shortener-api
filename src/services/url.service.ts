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
}
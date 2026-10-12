import { z } from 'zod';

export const createUrlSchema = z.object({
  originalUrl: z
    .string({ message: 'URL is required' })
    .trim()
    .url({ message: 'Please provide a valid URL' })
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      {
        message: 'Only HTTP and HTTPS URLs are permitted',
      }
    ),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
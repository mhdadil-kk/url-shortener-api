import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('https://urshortlink.vercel.app'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/url_shortener_dev'),
  JWT_SECRET: z.string().min(32, {
    message: 'JWT_SECRET must be at least 32 characters long for security',
  }).default('default_fallback_jwt_secret_key_minimum_32_characters_for_safety'),
  JWT_EXPIRES_IN: z.string().default('2h'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    console.warn('⚠️ Environment validation warning:', errorDetails);
    return envSchema.parse({
      JWT_SECRET: process.env.JWT_SECRET || 'default_fallback_jwt_secret_key_minimum_32_characters_for_safety',
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/url_shortener_dev',
      CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'https://urshortlink.vercel.app',
    });
  }

  return result.data;
};

export const env = parseEnv();

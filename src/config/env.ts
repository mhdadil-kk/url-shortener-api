import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  CLIENT_ORIGIN: z.string().default('https://urshortlink.vercel.app'),
  MONGODB_URI: z.string().default(
    'mongodb+srv://adilkk816_db_user:d4g3a9AyJBE0Dop4@cluster0.kfrzkkv.mongodb.net/url_shortener_dev?retryWrites=true&w=majority&appName=Cluster0'
  ),
  JWT_SECRET: z.string().default('l9m4ZTrJhCikfy4Xmgbimwc+II+mdNgNunHj96P2PzQ='),
  JWT_EXPIRES_IN: z.string().default('2h'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    console.error('❌ Invalid environment configuration:', errorDetails);
    throw new Error(`Invalid environment configuration: ${errorDetails}`);
  }

  return result.data;
};

export const env = parseEnv();

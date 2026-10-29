/// <reference path="../src/types/express.d.ts" />
import type { Request, Response } from 'express';
import { app } from '../src/app.js';
import { connectDB } from '../src/lib/db.js';

export default async function handler(req: Request, res: Response): Promise<void> {
  const origin = req.headers.origin as string | undefined;

  // 1. Immediately set CORS headers for web requests
  if (
    !origin ||
    origin.endsWith('.vercel.app') ||
    origin.includes('localhost') ||
    origin === 'https://urshortlink.vercel.app'
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,PATCH,OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-Requested-With,Accept'
    );
  }

  // 2. Preflight OPTIONS requests respond immediately with 204 No Content
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // 3. Connect to database
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection failed in serverless handler:', err);
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to connect to database',
    });
    return;
  }

  // 4. Run Express application
  return new Promise<void>((resolve) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    app(req, res);
  });
}

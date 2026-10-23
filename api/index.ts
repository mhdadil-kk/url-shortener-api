/// <reference path="../src/types/express.d.ts" />
import type { Request, Response } from 'express';
import { app } from '../src/app.js';
import { connectDB } from '../src/lib/db.js';

export default async function handler(req: Request, res: Response): Promise<void> {
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

  return new Promise<void>((resolve) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    app(req, res);
  });
}

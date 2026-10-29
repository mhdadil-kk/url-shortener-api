/// <reference path="./types/express.d.ts" />
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectDB } from './lib/db.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/error-handler.js';
import { AppError } from './utils/app-error.js';

import { authRouter } from './routes/auth.routes.js';
import { urlRouter } from './routes/url.routes.js';
import { redirectRouter } from './routes/redirect.routes.js';
import { generalLimiter, authLimiter } from './middleware/rate-limiter.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === env.CLIENT_ORIGIN ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Auto-connect DB in serverless requests (cached automatically)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health checks
app.use('/api', healthRouter);
app.use('/health', healthRouter);

// Rate limiter for API
app.use('/api', generalLimiter);

// Auth routes (support both /api/auth and /auth for flexible rewrites)
app.use('/api/auth', authLimiter, authRouter);
app.use('/auth', authLimiter, authRouter);

// URL management routes
app.use('/api/urls', urlRouter);
app.use('/urls', urlRouter);

// Short redirect routes
app.use('/s', redirectRouter);

app.use((req, _res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

export { app };

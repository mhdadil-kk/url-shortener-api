import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/error-handler.js';
import { AppError } from './utils/app-error.js';

import { authRouter } from './routes/auth.routes.js';
import { urlRouter } from './routes/url.routes.js';
import { redirectRouter } from './routes/redirect.routes.js';

const app = express();


app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/api', healthRouter);

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/urls', urlRouter);
app.use('/s', redirectRouter);

app.use((req, _res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

export { app };
import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: 'Server is healthy',
    },
  });
});
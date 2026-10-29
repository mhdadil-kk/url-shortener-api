import { Router, Request, Response } from 'express';

export const healthRouter = Router();

const sendHealth = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: 'Server is healthy',
    },
  });
};

healthRouter.get('/health', sendHealth);
healthRouter.get('/', sendHealth);

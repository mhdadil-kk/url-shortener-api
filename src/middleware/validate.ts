import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed; 
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        
        const formattedErrors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          status: 'fail',
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }

      next(error);
    }
  };
};
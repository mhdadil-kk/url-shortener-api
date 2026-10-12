import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.js';
import { registerSchema } from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), AuthController.register);
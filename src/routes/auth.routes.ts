import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), AuthController.register);
authRouter.post('/verify-otp', validateRequest(verifyOtpSchema), AuthController.verifyOtp);
authRouter.post('/resend-otp', validateRequest(resendOtpSchema), AuthController.resendOtp);
authRouter.post('/login', validateRequest(loginSchema), AuthController.login);

authRouter.get('/me', authenticate, AuthController.getMe);
authRouter.post('/logout', authenticate, AuthController.logout);
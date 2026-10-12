import { Router } from 'express';
import { UrlController } from '../controllers/url.controller.js';

export const redirectRouter = Router();

redirectRouter.get('/:shortCode', UrlController.redirectUrl);
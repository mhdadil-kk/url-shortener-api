import { Router } from 'express';
import { UrlController } from '../controllers/url.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createUrlSchema } from '../validators/url.validator.js';

export const urlRouter = Router();

urlRouter.use(authenticate);

urlRouter.post('/', validateRequest(createUrlSchema), UrlController.createUrl);
urlRouter.get('/', UrlController.getUserUrls);
urlRouter.get('/:id', UrlController.getUrlById);
urlRouter.delete('/:id', UrlController.deleteUrl);
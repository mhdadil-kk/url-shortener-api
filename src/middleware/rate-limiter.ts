import rateLimit from 'express-rate-limit';


export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: 'draft-7', 
  legacyHeaders: false, 
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many login/registration attempts from this IP, please try again after 15 minutes.',
  },
});
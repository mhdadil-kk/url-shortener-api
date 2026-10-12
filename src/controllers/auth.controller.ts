import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { env } from '../config/env.js';

export class AuthController {
    public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await AuthService.register(req.body);


            res.cookie('token', token, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 2 * 60 * 60 * 1000,
            });


            res.status(201).json({
                status: 'success',
                message: 'User registered successfully',
                data: {
                    user,
                  
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    }


    public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await AuthService.login(req.body);
            res.cookie('token', token, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 2 * 60 * 60 * 1000,
            });
            res.status(200).json({
                status: 'success',
                message: 'Logged in successfully',
                data: {
                    user,
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}



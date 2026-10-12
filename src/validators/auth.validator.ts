import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Please provide a valid email address' })
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100, { message: 'Password cannot exceed 100 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Please provide a valid email address' })
    .transform((val) => val.trim().toLowerCase()),
  password: z.string({ message: 'Password is required' }),
});

export const verifyOtpSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Please provide a valid email address' })
    .transform((val) => val.trim().toLowerCase()),
  otp: z
    .string({ message: 'OTP is required' })
    .length(6, { message: 'OTP must be exactly 6 digits' })
    .regex(/^\d{6}$/, { message: 'OTP must contain only numbers' }),
});

export const resendOtpSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Please provide a valid email address' })
    .transform((val) => val.trim().toLowerCase()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
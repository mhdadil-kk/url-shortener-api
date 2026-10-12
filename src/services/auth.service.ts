import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models/user.model.js';
import { Otp } from '../models/otp.model.js';
import { RegisterInput, LoginInput, VerifyOtpInput, ResendOtpInput } from '../validators/auth.validator.js';
import { AppError } from '../utils/app-error.js';
import { signToken } from '../utils/token.js';
import { EmailService } from './email.service.js';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly OTP_EXPIRY_MINUTES = 10;
  private static readonly RESEND_COOLDOWN_SECONDS = 60;
  private static readonly MAX_OTP_ATTEMPTS = 5;


  private static generateOtpCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }


  private static async issueAndSendOtp(email: string): Promise<void> {
    await Otp.deleteMany({ email });
    const rawOtp = this.generateOtpCode();
    const otpHash = await bcrypt.hash(rawOtp, 10);

    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.create({
      email,
      otpHash,
      attempts: 0,
      expiresAt,
      lastResentAt: new Date(),
    });

    await EmailService.sendOtpEmail(email, rawOtp);
  }

  public static async register(input: RegisterInput): Promise<{ email: string; message: string }> {
    const { email, password } = input;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new AppError('An account with this email already exists and is verified. Please log in.', 409);
      }

      const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
      existingUser.passwordHash = passwordHash;
      await existingUser.save();

      await this.issueAndSendOtp(email);

      return {
        email,
        message: 'Account pending verification. A new verification code has been sent to your email.',
      };
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    await User.create({
      email,
      passwordHash,
      isVerified: false,
    });

    await this.issueAndSendOtp(email);

    return {
      email,
      message: 'Registration initiated. Please verify your email with the 6-digit code sent.',
    };
  }


  public static async verifyOtp(input: VerifyOtpInput): Promise<{ user: IUserDocument; token: string }> {
    const { email, otp } = input;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      throw new AppError('No active verification code found for this email. Please request a new one.', 400);
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      throw new AppError('Verification code has expired. Please request a new code.', 400);
    }

    if (otpRecord.attempts >= this.MAX_OTP_ATTEMPTS) {
      await Otp.deleteOne({ _id: otpRecord._id }); // Burn the compromised OTP
      throw new AppError('Too many failed attempts. This code is now invalid. Please request a new code.', 429);
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remaining = this.MAX_OTP_ATTEMPTS - otpRecord.attempts;
      throw new AppError(`Invalid verification code. You have ${remaining} attempt(s) remaining.`, 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User account not found.', 404);
    }

    user.isVerified = true;
    await user.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    const token = signToken({ userId: user._id.toString() });

    return { user, token };
  }


  public static async resendOtp(input: ResendOtpInput): Promise<{ message: string }> {
    const { email } = input;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No account found with this email.', 404);
    }

    if (user.isVerified) {
      throw new AppError('This account is already verified. Please log in.', 400);
    }

    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const elapsedSeconds = Math.floor((Date.now() - existingOtp.lastResentAt.getTime()) / 1000);
      if (elapsedSeconds < this.RESEND_COOLDOWN_SECONDS) {
        const remaining = this.RESEND_COOLDOWN_SECONDS - elapsedSeconds;
        throw new AppError(`Please wait ${remaining} seconds before requesting a new code.`, 429);
      }
    }

    await this.issueAndSendOtp(email);

    return { message: 'A new verification code has been sent to your email.' };
  }


  public static async login(input: LoginInput): Promise<{ user: IUserDocument; token: string }> {
    const { email, password } = input;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email address before logging in.', 403);
    }

    const token = signToken({ userId: user._id.toString() });

    return { user, token };
  }
}
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });

  public static async sendOtpEmail(email: string, otp: string): Promise<void> {
    const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

    console.log(`📧 [EMAIL NOTIFICATION] To: ${email}`);
    console.log(`verification code is: ${otp}`);
  

    if (isSmtpConfigured && env.NODE_ENV === 'production') {
      try {
        await this.transporter.sendMail({
          from: process.env.FROM_EMAIL || '"ShortLink Auth" <noreply@shortlink.app>',
          to: email,
          subject: 'Your Verification Code - ShortLink',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5; text-align: center;">Verify Your Email</h2>
              <p>Thank you for signing up for ShortLink. Enter the 6-digit verification code below to activate your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; background: #eef2ff; padding: 10px 20px; border-radius: 8px; border: 1px dashed #4f46e5;">
                  ${otp}
                </span>
              </div>
              <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not create this account, please ignore this email.</p>
            </div>
          `,
        });
      } catch (error) {
        console.error('❌ Failed to send SMTP email:', error);
      }
    }
  }
}
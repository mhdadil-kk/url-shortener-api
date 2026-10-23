/**
 * EmailService
 *
 * Uses Brevo (formerly Sendinblue) Transactional Email HTTP API.
 * This avoids SMTP port blocking on hosting platforms like Render's free tier.
 * Render blocks outbound TCP connections on SMTP ports (25, 465, 587),
 * but HTTPS API calls (port 443) work fine.
 *
 * Setup:
 *   1. Create a free account at https://app.brevo.com
 *   2. Go to Settings → SMTP & API → API Keys → Generate a new API key
 *   3. Go to Settings → Senders & IPs → Add and verify your sender email
 *   4. Set BREVO_API_KEY and FROM_EMAIL in your environment variables
 */

import nodemailer from 'nodemailer';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export class EmailService {
  private static getSmtpTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public static async sendOtpEmail(email: string, otp: string): Promise<void> {
    console.log(`📧 [EMAIL] To: ${email} | OTP: ${otp}`);

    const brevoApiKey = process.env.BREVO_API_KEY;
    const isSmtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    const fromEmail = process.env.FROM_EMAIL || 'noreply@shortlink.app';
    const fromName = 'ShortLink';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Verify Your Email</h2>
        <p>Thank you for signing up for <strong>ShortLink</strong>. Enter the 6-digit verification code below to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e1b4b; background: #eef2ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #4f46e5; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px; text-align: center;">
          This code expires in <strong>10 minutes</strong>.<br/>
          If you did not create this account, please ignore this email.
        </p>
      </div>
    `;

    // 1. Try Brevo HTTP API first if BREVO_API_KEY is available
    if (brevoApiKey) {
      try {
        const response = await fetch(BREVO_API_URL, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: fromName, email: fromEmail },
            to: [{ email }],
            subject: 'Your Verification Code - ShortLink',
            htmlContent,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Brevo API error ${response.status}: ${errorBody}`);
        }

        console.log(`✅ [EMAIL] OTP sent successfully via Brevo to ${email}`);
        return;
      } catch (error) {
        console.error('❌ [EMAIL] Failed to send email via Brevo:', error);
      }
    }

    // 2. Try Nodemailer SMTP if SMTP credentials are provided
    if (isSmtpConfigured) {
      try {
        const transporter = this.getSmtpTransporter();
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: email,
          subject: 'Your Verification Code - ShortLink',
          html: htmlContent,
        });
        console.log(`✅ [EMAIL] OTP sent successfully via Nodemailer SMTP to ${email}`);
        return;
      } catch (error) {
        console.error('❌ [EMAIL] Failed to send SMTP email via Nodemailer:', error);
      }
    }

    console.warn('⚠️ [EMAIL] Neither Brevo nor SMTP configured or both failed — OTP printed to console only.');
  }
}
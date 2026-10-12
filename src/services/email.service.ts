import nodemailer from 'nodemailer';

export class EmailService {
  // Lazy transporter: created on first use so env vars are always current
  private static getTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public static async sendOtpEmail(email: string, otp: string): Promise<void> {
    const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    // Always log OTP to console (useful for all environments)
    console.log(`📧 [EMAIL] To: ${email} | OTP: ${otp}`);

    if (isSmtpConfigured) {
      try {
        const transporter = this.getTransporter();
        await transporter.sendMail({
          from: process.env.FROM_EMAIL || '"ShortLink" <noreply@shortlink.app>',
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
              <p style="color: #64748b; font-size: 13px;">This code expires in <strong>10 minutes</strong>. If you did not create this account, please ignore this email.</p>
            </div>
          `,
        });
        console.log(`✅ [EMAIL] OTP sent successfully to ${email}`);
      } catch (error) {
        console.error('❌ [EMAIL] Failed to send SMTP email:', error);
      }
    } else {
      console.warn('⚠️ [EMAIL] SMTP not configured — OTP printed to console only.');
    }
  }
}
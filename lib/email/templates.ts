import type { EmailTemplate } from '@/lib/email/types';

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  OTP_VERIFICATION: {
    subject: 'Your NiveshX Verification Code',
    html: (data: { firstName: string; otp: string }) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center;">NiveshX Email Verification</h2>
            <p>Hello ${data.firstName},</p>
            <p>Thank you for registering with NiveshX. Please use the following verification code to complete your registration:</p>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
              <h2 style="letter-spacing: 4px; color: #007bff; margin: 0;">${data.otp}</h2>
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
  },
  PASSWORD_RESET: {
    subject: 'Reset Your NiveshX Password',
    html: (data: { firstName: string; resetCode: string; resetLink: string }) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center;">NiveshX Password Reset</h2>
            <p>Hello ${data.firstName},</p>
            <p>We received a request to reset your NiveshX account password. Use the following code to complete the process:</p>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
              <h2 style="letter-spacing: 4px; color: #007bff; margin: 0;">${data.resetCode}</h2>
            </div>
            <p>Or click the button below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${data.resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
  },
};

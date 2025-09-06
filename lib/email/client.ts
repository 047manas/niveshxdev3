import nodemailer from 'nodemailer';
import { EMAIL_TEMPLATES } from './templates';
import { EmailOptions } from './types';

class EmailClient {
  private transporter: nodemailer.Transporter | null = null;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  async initialize(): Promise<void> {
    if (this.transporter) {
      return;
    }

    try {
      if (process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_USER && process.env.EMAIL_SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SMTP_HOST,
          port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
          secure: process.env.EMAIL_SMTP_PORT === '465',
          auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
        // Verify connection
        await this.transporter.verify();
        console.log('Email service configured successfully with production SMTP.');
      } else {
        await this.initializeDevelopmentTransport();
      }
    } catch (error) {
      console.error('Failed to initialize production email service:', error);
      await this.initializeDevelopmentTransport();
    }
  }

  private async initializeDevelopmentTransport(): Promise<void> {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('---');
      console.log('INFO: Using Ethereal for development/testing.');
      console.log('INFO: View test emails at: https://ethereal.email/messages');
      console.log(`Ethereal User: ${testAccount.user}`);
      console.log(`Ethereal Pass: ${testAccount.pass}`);
      console.log('---');

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.error('Failed to initialize development email service:', error);
      throw new Error('Could not initialize email service');
    }
  }

  private async sendWithRetry(options: EmailOptions, attempts: number = 0): Promise<nodemailer.SentMessageInfo> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const info = await this.transporter.sendMail(options);
      
      // Log Ethereal URL in development
      if (info.response && info.response.includes('Ethereal')) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }

      return info;
    } catch (error) {
      if (attempts < this.retryAttempts) {
        console.log(`Email send attempt ${attempts + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.sendWithRetry(options, attempts + 1);
      }
      throw error;
    }
  }

  async sendOTPEmail(to: string, firstName: string, otp: string): Promise<void> {
    if (!this.transporter) {
      await this.initialize();
    }
    
    console.log('Starting OTP email send process...', { to, firstName });
    
    const template = EMAIL_TEMPLATES.OTP_VERIFICATION;
    console.log('Email template:', { 
      templateExists: !!template,
      subject: template?.subject
    });

    if (!template) {
      console.error('OTP verification template not found!');
      throw new Error('Email template not found');
    }

    const options: EmailOptions = {
      from: `"NiveshX" <${process.env.EMAIL_FROM || 'no-reply@niveshx.app'}>`,
      to,
      subject: template.subject,
      html: template.html({ firstName, otp }),
    };

    console.log('Email configuration:', { 
      smtpHost: process.env.EMAIL_SMTP_HOST,
      smtpPort: process.env.EMAIL_SMTP_PORT,
      smtpUser: process.env.EMAIL_SMTP_USER,
      fromEmail: process.env.EMAIL_FROM || 'no-reply@niveshx.app'
    });

    try {
      console.log('Attempting to send email...');
      await this.sendWithRetry(options);
      console.log('OTP email sent successfully!');
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(to: string, firstName: string, resetCode: string, resetLink: string): Promise<void> {
    const template = EMAIL_TEMPLATES.PASSWORD_RESET;
    const options: EmailOptions = {
      from: `"NiveshX" <${process.env.EMAIL_FROM || 'no-reply@niveshx.app'}>`,
      to,
      subject: template.subject,
      html: template.html({ firstName, resetCode, resetLink }),
    };

    try {
      await this.sendWithRetry(options);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

// Create a singleton instance
const emailClient = new EmailClient();

// Initialize when module is loaded
emailClient.initialize().catch(console.error);

export default emailClient;

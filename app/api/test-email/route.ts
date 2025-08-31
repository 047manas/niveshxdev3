import { NextRequest, NextResponse } from 'next/server';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Log environment variables (without exposing sensitive data)
    console.log('🔧 Email Configuration Check:');
    console.log('- SMTP Host:', process.env.EMAIL_SMTP_HOST || 'NOT SET');
    console.log('- SMTP Port:', process.env.EMAIL_SMTP_PORT || 'NOT SET');
    console.log('- SMTP User:', process.env.EMAIL_SMTP_USER || 'NOT SET');
    console.log('- SMTP Pass:', process.env.EMAIL_SMTP_PASS ? '***CONFIGURED***' : 'NOT SET');
    console.log('- Email From:', process.env.EMAIL_FROM || 'NOT SET');

    // Send test email
    await sendOtpEmail(
      email,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">🧪 Email Test - NiveshX</h2>
          <p>Hello!</p>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #10B981; margin: 0;">Test OTP Code</h3>
            <h1 style="font-size: 32px; letter-spacing: 4px; color: #10B981; margin: 10px 0;">123456</h1>
          </div>
          <p><strong>✅ If you received this email, your email system is working correctly!</strong></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is a test email from your NiveshX application.<br>
            Environment: ${process.env.NODE_ENV || 'development'}
          </p>
        </div>
      `,
      'NiveshX Email Test - Configuration Check'
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully! Check your inbox.',
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error: any) {
    console.error('❌ Test email failed:', error);
    
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error.message,
      code: error.code || 'UNKNOWN'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint. Use POST with { "email": "your@email.com" }',
    environment: process.env.NODE_ENV || 'development',
    emailConfigured: !!(process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_USER && process.env.EMAIL_SMTP_PASS)
  });
}
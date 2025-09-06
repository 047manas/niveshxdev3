import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null;

// This function initializes the email transporter.
// It will use production credentials if they are available as environment variables.
// Otherwise, it will fall back to a temporary Ethereal test account for development.
const initializeEmail = async () => {
  if (transporter) {
    return; // Already initialized
  }

  // Check if production email credentials are provided in environment variables
  if (process.env.EMAIL_SMTP_HOST && process.env.EMAIL_SMTP_USER && process.env.EMAIL_SMTP_PASS) {
    // Use production SMTP transporter
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
      secure: (process.env.EMAIL_SMTP_PORT === '465'), // `secure:true` is required for port 465
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
      // Additional options for Gmail
      tls: {
        rejectUnauthorized: false // This helps with some Gmail authentication issues
      }
    });
    console.log("Email service configured for production with Gmail SMTP.");

    // Test the connection
    try {
      await transporter.verify();
      console.log("Gmail SMTP connection verified successfully.");
    } catch (error) {
      console.error("Gmail SMTP connection failed:", error);
      console.log("Falling back to Ethereal for development...");
      // Fall back to Ethereal if Gmail fails
      transporter = null;
    }
  }

  // If no production credentials or Gmail failed, use Ethereal
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    console.log("---");
    console.log("INFO: Using Ethereal for development/testing.");
    console.log("INFO: View test emails at: https://ethereal.email/messages");
    console.log(`Ethereal User: ${testAccount.user}`);
    console.log(`Ethereal Pass: ${testAccount.pass}`);
    console.log("---");

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// Function to send the OTP/Password Reset email
export const sendOtpEmail = async (to: string, body: string, subject?: string) => {
  // Ensure the transporter is initialized before sending an email
  if (!transporter) {
    await initializeEmail();
  }

  // Double-check that transporter is available after initialization
  if (!transporter) {
    throw new Error('Failed to initialize email transporter.');
  }

  const mailOptions = {
    from: `"Niveshx" <${process.env.EMAIL_FROM || 'no-reply@niveshx.app'}>`,
    to: to,
    subject: subject || 'Your Verification Code',
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    // Log the Ethereal preview URL if we're in development mode
    if (info.response && info.response.includes('Ethereal')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};

// Initialize the email service when the module is loaded
initializeEmail().catch(console.error);

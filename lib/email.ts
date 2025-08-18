import nodemailer from 'nodemailer';

// Create a single transporter for the application lifetime
let transporter;
let testAccount;

// Function to initialize the email transporter
export const initializeEmail = async () => {
  if (transporter) {
    return; // Already initialized
  }

  // Generate a test account from Ethereal
  testAccount = await nodemailer.createTestAccount();

  console.log("--- ETHEREAL TEST ACCOUNT ---");
  console.log("User:", testAccount.user);
  console.log("Pass:", testAccount.pass);
  console.log("Preview URL:", nodemailer.getTestMessageUrl({ info: null })); // Generic preview link
  console.log("----------------------------");

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Function to send the OTP email
export const sendOtpEmail = async (to: string, otp: string) => {
  if (!transporter) {
    await initializeEmail();
  }

  const mailOptions = {
    from: '"Niveshx" <no-reply@niveshx.app>',
    to: to,
    subject: 'Your OTP for Niveshx',
    html: `<p>Your One-Time Password is: <strong>${otp}</strong></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    // Log the preview URL for the sent email
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info); // Return the URL for testing
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email.');
  }
};

// No longer initialize on startup

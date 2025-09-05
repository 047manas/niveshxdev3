# Email Setup Guide

## Current Status
The email system is currently configured to use **Ethereal Email** for development, which means:
- ✅ Emails will be sent successfully 
- ✅ You can view test emails at https://ethereal.email/messages
- ✅ No real emails are sent to users (safe for testing)

## Setting up Gmail SMTP (Production)

To use real Gmail SMTP for sending emails, follow these steps:

### 1. Enable 2-Factor Authentication
- Go to your Gmail account settings
- Enable 2-Factor Authentication (required for App Passwords)

### 2. Generate App Password
- Go to Google Account settings > Security > 2-Step Verification > App passwords
- Generate a new App Password for "Mail"
- Copy the 16-character password (something like: `abcd efgh ijkl mnop`)

### 3. Update .env.local
Uncomment and update these lines in `.env.local`:
```bash
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password-here
EMAIL_FROM=your-email@gmail.com
```

### 4. Restart the Development Server
After updating the environment variables, restart your development server:
```bash
npm run dev
```

## Troubleshooting

### Common Gmail Errors:
1. **"Username and Password not accepted"** - You're using your regular password instead of an App Password
2. **"Less secure app access"** - Google disabled this. You must use App Passwords
3. **"Authentication failed"** - Make sure 2FA is enabled and you're using the correct App Password

### Testing
- With Ethereal: Check console logs for the preview URL
- With Gmail: Emails will be sent to real email addresses

## Current Configuration
The system automatically:
1. Tries to use Gmail if credentials are provided
2. Falls back to Ethereal if Gmail fails or no credentials are provided
3. Logs which email service is being used

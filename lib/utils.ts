import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import admin from './firebase-admin';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  reset: number; // timestamp when the rate limit resets
}

/**
 * Rate limits an action based on an identifier
 * @param identifier - Unique identifier for the rate limited action (e.g., "resend-otp:user@email.com")
 * @param maxAttempts - Maximum number of attempts allowed within the time window
 * @param windowSeconds - Time window in seconds
 * @returns Promise<RateLimitResult>
 */
export async function rateLimit(
  identifier: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const firestore = admin.firestore();
  const rateLimitRef = firestore.collection('rate_limits').doc(identifier);

  // Run in transaction to ensure accuracy
  const result = await firestore.runTransaction(async (transaction) => {
    const doc = await transaction.get(rateLimitRef);
    const now = Date.now();

    if (!doc.exists) {
      // First attempt
      transaction.set(rateLimitRef, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return {
        success: true,
        limit: maxAttempts,
        reset: now + (windowSeconds * 1000)
      };
    }

    const data = doc.data()!;
    const windowStart = data.firstAttempt;
    const windowEnd = windowStart + (windowSeconds * 1000);

    if (now > windowEnd) {
      // Window has expired, reset counter
      transaction.set(rateLimitRef, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return {
        success: true,
        limit: maxAttempts,
        reset: now + (windowSeconds * 1000)
      };
    }

    if (data.attempts >= maxAttempts) {
      // Rate limit exceeded
      return {
        success: false,
        limit: maxAttempts,
        reset: windowEnd
      };
    }

    // Increment attempt counter
    transaction.update(rateLimitRef, {
      attempts: admin.firestore.FieldValue.increment(1),
      lastAttempt: now
    });

    return {
      success: true,
      limit: maxAttempts,
      reset: windowEnd
    };
  });

  return result;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateStrongPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function isStrongPassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  
  if (!/[!@#$%^&*()_+]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }
  
  return { isValid: true, message: "Password meets all requirements" };
}

// Phone number validation
export function validatePhoneNumber(phone: { countryCode: string; number: string }): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  const fullNumber = phone.countryCode + phone.number;
  return phoneRegex.test(fullNumber);
}

// URL validation
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Date validation helpers
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function formatDate(date: Date): string {
  return date.toISOString();
}

// Generic error handler
export function handleError(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500
    };
  }
  return {
    message: 'An unexpected error occurred',
    status: 500
  };
}

// Firestore data sanitization
export function sanitizeFirestoreData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestoreData(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        sanitized[key] = sanitizeFirestoreData(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

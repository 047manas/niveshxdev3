import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

import {
  UserAccountFormData,
  CompanyProfileFormData,
  CompanyDetailsFormData,
  FundingHistoryFormData,
  ContactFormData,
  OtpFormData,
} from '@/types/forms';

const API_BASE_URL = '/api';

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred.');
  }
  return data;
};

// --- Auth APIs ---

export const checkEmail = (email: string) => {
  return fetch(`${API_BASE_URL}/auth/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(handleResponse);
};

export const registerUser = (data: UserAccountFormData) => {
  return fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, userType: 'company' }),
  }).then(handleResponse);
};

export const verifyUserOtp = (email: string, otp: string) => {
  return fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  }).then(handleResponse);
};

export const resendUserOtp = (email: string) => {
  return fetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(handleResponse);
};

// --- Company APIs ---

export const checkCompany = (email: string, companyWebsite: string) => {
    return fetch(`${API_BASE_URL}/company/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            step: 'checkCompany',
            email,
            companyWebsite,
        }),
    }).then(handleResponse);
};

export const createCompany = (email: string, companyData: any) => {
    return fetch(`${API_BASE_URL}/company/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            step: 'createCompany',
            email,
            companyData,
        }),
    }).then(handleResponse);
};

export const sendCompanyVerificationOtp = (companyId: string) => {
    return fetch(`${API_BASE_URL}/company/send-verification-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
    }).then(handleResponse);
};

export const verifyCompanyOtp = (companyId: string, otp: string) => {
    return fetch(`${API_BASE_URL}/company/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, otp }),
    }).then(handleResponse);
};

export const resendCompanyOtp = (companyId: string) => {
    return fetch(`${API_BASE_URL}/company/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
    }).then(handleResponse);
};

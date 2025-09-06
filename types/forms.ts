import { z } from "zod";
import { 
    userAccountSchema,
    otpSchema,
    contactSchema 
} from "./schemas/account";
import {
    companyProfileSchema,
    companyDetailsSchema,
    fundingHistorySchema
} from "@/lib/schemas/company";

export type UserAccountFormData = z.infer<typeof userAccountSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;
export type CompanyDetailsFormData = z.infer<typeof companyDetailsSchema>;
export type FundingHistoryFormData = z.infer<typeof fundingHistorySchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

export type EmailValidation = {
    status: 'checking' | 'valid' | 'invalid';
    message: string;
};

export type FormData = 
    & UserAccountFormData 
    & CompanyProfileFormData 
    & CompanyDetailsFormData 
    & FundingHistoryFormData;

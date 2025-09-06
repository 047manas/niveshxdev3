import { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { CheckedState } from '@radix-ui/react-checkbox';

export interface OtpVerificationStepProps {
    onOtpSubmit: (data: { otp: string }) => Promise<void>;
    isLoading: boolean;
    userEmail: string;
    onResendOtp: () => Promise<void>;
}

export interface SignUpProps {
    setCurrentView: (view: string) => void;
    userType: string;
    setUserType: (type: string) => void;
}

export interface SignUpFormData {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    countryCode: string;
    password: string;
    confirmPassword: string;
    linkedinProfile: string;
    investorType: string;
    investmentType: string[];
    chequeSize: string;
    interestedSectors: string;
}

export interface InvestorStep1Props {
    control: Control<SignUpFormData>;
    register: UseFormRegister<SignUpFormData>;
    errors: FieldErrors<SignUpFormData>;
    onEmailBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    emailValidation: {
        status: 'idle' | 'checking' | 'valid' | 'invalid';
        message: string;
    };
}

export interface InvestorStep2Props {
    control: Control<SignUpFormData>;
    errors: FieldErrors<SignUpFormData>;
    setValue: UseFormSetValue<SignUpFormData>;
}

export interface VerifyOtpProps {
    setCurrentView: (view: string) => void;
}

export interface EmailValidation {
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message: string;
}

export type InvestorType = 'UHNI/HNI' | 'Family Office' | 'VC' | 'Private Equity';
export type InvestmentType = 'Equity investments' | 'Debt financing' | 'Both';

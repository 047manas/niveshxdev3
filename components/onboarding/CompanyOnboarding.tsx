"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
    userAccountSchema,
    otpSchema,
    contactSchema
} from "@/types/schemas/account";
import { 
    industries,
    companyProfileSchema, 
    companyDetailsSchema, 
    fundingHistorySchema 
} from "@/lib/schemas/company";
import type {
    UserAccountFormData,
    OtpFormData,
    CompanyProfileFormData,
    CompanyDetailsFormData,
    FundingHistoryFormData,
    ContactFormData,
    EmailValidation
} from "@/types/forms";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import { sharedStyles } from '@/styles/shared';
import { Loader2, Building2, Star, Award, Briefcase } from 'lucide-react';
// FormError component replaced with inline error styling

// --- Zod Schemas ---





// Component Props
interface UserAccountStepProps {
  onFormSubmit: (data: UserAccountFormData) => void;
  isLoading: boolean;
  onEmailBlur: (email: string) => void;
  emailValidation: EmailValidation;
}

interface OtpVerificationStepProps {
  onOtpSubmit: (data: OtpFormData) => void;
  isLoading: boolean;
  userEmail: string;
  onResendOtp: () => void;
  onBack: () => void;
}

interface CompanyProfileStepProps {
  onFormSubmit: (data: CompanyProfileFormData) => void;
  onBack: () => void;
  isLoading: boolean;
  onStartOver: () => void;
}

interface CompanyVerifyPromptStepProps {
  onNext: () => void;
  companyName: string;
}

interface CompanyDetailsStepProps {
  onFormSubmit: (data: CompanyDetailsFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

interface FundingHistoryStepProps {
  onFormSubmit: (data: FundingHistoryFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

interface CompanyContactStepProps {
  onFormSubmit: (data: ContactFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

// Additional interfaces
interface CompanyOtpVerificationStepProps {
    onOtpSubmit: (data: OtpFormData) => void;
    isLoading: boolean;
    companyEmail: string;
    onResendOtp: () => Promise<void>;
}

interface SuccessStepProps {
    message: string;
}

interface OnboardingData {
    user?: {
        email: string;
        userId?: string;
    };
    company?: {
        companyName?: string;
        companyId?: string;
        contactEmail?: string;
    };
}

// --- Step Components ---

const UserAccountStep: React.FC<UserAccountStepProps> = ({ onFormSubmit, isLoading, onEmailBlur, emailValidation }) => {
    const { register, handleSubmit, control, formState: { errors } } = useForm<UserAccountFormData>({
        resolver: zodResolver(userAccountSchema),
        mode: 'onChange',
        defaultValues: {
            phone: { countryCode: "+91" }
        }
    });
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">Create Your Account</h3>
                <p className="text-gray-400 text-sm">Start your journey with us by creating your account</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">First Name</Label>
                    <Input 
                        {...register("firstName")} 
                        className="bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors" 
                        placeholder="Enter your first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Name</Label>
                    <Input 
                        {...register("lastName")} 
                        className="bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors" 
                        placeholder="Enter your last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">Your Designation</Label>
                    <Controller 
                        name="designation" 
                        control={control} 
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors">
                                    <SelectValue placeholder="Select your role..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="Co-founder">Co-founder</SelectItem>
                                    <SelectItem value="CEO">CEO</SelectItem>
                                    <SelectItem value="CTO">CTO</SelectItem>
                                    <SelectItem value="HR">HR</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        )} 
                    />
                    {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">Personal LinkedIn Profile</Label>
                    <div className="relative">
                        <Input 
                            {...register("linkedinProfile")} 
                            placeholder="https://linkedin.com/in/your-profile" 
                            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors pl-10" 
                        />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                        </svg>
                    </div>
                    {errors.linkedinProfile && <p className="text-red-500 text-sm mt-1">{errors.linkedinProfile.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">Your Work Email</Label>
                    <div className="relative">
                        <Input 
                            type="email" 
                            {...register("email")} 
                            onBlur={(e) => onEmailBlur(e.target.value)} 
                            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors pl-10" 
                            placeholder="your.name@company.com"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    {emailValidation.status === 'checking' && (
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {emailValidation.message}
                        </p>
                    )}
                    {emailValidation.status === 'valid' && (
                        <p className="text-xs text-green-500 flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {emailValidation.message}
                        </p>
                    )}
                    {emailValidation.status === 'invalid' && (
                        <p className="text-xs text-red-500 flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {emailValidation.message}
                        </p>
                    )}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <Controller 
                            name="phone.countryCode" 
                            control={control} 
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue="+91">
                                    <SelectTrigger className="sm:col-span-1 bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                        <SelectItem value="+91">IN (+91)</SelectItem>
                                        <SelectItem value="+1">US (+1)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} 
                        />
                        <div className="relative sm:col-span-3">
                            <Input 
                                type="tel" 
                                {...register("phone.number")} 
                                className="bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors pl-10" 
                                placeholder="Enter your phone number"
                            />
                            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                    </div>
                    {errors.phone?.number && <p className="text-red-500 text-sm mt-1">{errors.phone.number.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Create Password</Label>
                    <div className="relative">
                        <Input 
                            type="password" 
                            {...register("password")} 
                            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors pl-10" 
                            placeholder="Enter your password"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Must be 8+ characters and include an uppercase letter, a number, and a special character.
                    </p>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                        <Input 
                            type="password" 
                            {...register("confirmPassword")} 
                            className="bg-gray-800/50 border-gray-700 focus:border-blue-500 transition-colors pl-10" 
                            placeholder="Confirm your password"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>
            </div>
            <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full mt-8 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 transition-all duration-200 font-medium py-2.5"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Account...
                    </div>
                ) : (
                    'Create Account & Verify Email'
                )}
            </Button>
        </form>
    );
};

const OtpVerificationStep: React.FC<OtpVerificationStepProps> = ({ onOtpSubmit, isLoading, userEmail, onResendOtp, onBack }) => {
    const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
    const [cooldown, setCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleResend = async () => {
        setCooldown(60);
        setResendStatus('loading');
        try {
            await onResendOtp();
            setResendStatus('success');
        } catch (error) {
            setResendStatus('error');
            setCooldown(0); // Allow retry immediately on error
        }
    };

    return (
        <form onSubmit={handleSubmit(onOtpSubmit)}>
            <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">Step 2: Verify Your Email</h3>
                <p className="text-gray-400">An OTP has been sent to <span className="font-semibold text-primary">{userEmail}</span>.</p>
                <p className="text-sm text-gray-500">
                    Need to change your email or other details? You can go back and correct them.
                </p>
                <div className="flex justify-center">
                    <Controller name="otp" control={control} render={({ field }) => (<InputOTP maxLength={6} {...field}><InputOTPGroup>{[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP>)} />
                </div>
                {errors.otp && <p className="text-red-500 text-xs">{errors.otp.message}</p>}
                <div className="flex justify-center gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={onBack}>
                        Back to Account Info
                    </Button>
                    <Button type="submit" disabled={isLoading} className="px-8">
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                </div>
                <div className="mt-4 text-sm">
                    <p className="text-gray-400">
                        Didn't receive the code?{' '}
                        <Button type="button" variant="link" className="p-0 h-auto" disabled={cooldown > 0} onClick={handleResend}>
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                        </Button>
                    </p>
                    {resendStatus === 'success' && <p className="text-green-500">A new OTP has been sent.</p>}
                    {resendStatus === 'error' && <p className="text-red-500">Failed to resend OTP. Please try again.</p>}
                </div>
            </div>
        </form>
    );
};

const CompanyProfileStep: React.FC<CompanyProfileStepProps> = ({ onFormSubmit, onBack, isLoading, onStartOver }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<CompanyProfileFormData>({
        resolver: zodResolver(companyProfileSchema),
        mode: 'onChange'
    });
    
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Step 3: Company Profile</h3>
            <div className="space-y-2">
                <Label>Company Name</Label>
                <Input {...register("companyName")} className="bg-gray-700" />
                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName?.message?.toString()}</p>}
            </div>
            <div className="space-y-2">
                <Label>Company Website</Label>
                <Input {...register("companyWebsite")} placeholder="https://example.com" className="bg-gray-700" />
                {errors.companyWebsite && <p className="text-red-500 text-xs">{errors.companyWebsite?.message?.toString()}</p>}
            </div>
            <div className="space-y-2">
                <Label>Company LinkedIn (Optional)</Label>
                <Input {...register("companyLinkedin")} placeholder="https://linkedin.com/company/..." className="bg-gray-700" />
                {errors.companyLinkedin && <p className="text-red-500 text-xs">{errors.companyLinkedin?.message?.toString()}</p>}
            </div>
            <div className="space-y-2">
                <Label>One-Liner Pitch</Label>
                <Input {...register("oneLiner")} className="bg-gray-700" />
                <p className="text-xs text-gray-400 text-right">{watch('oneLiner', '').length}/150</p>
                {errors.oneLiner && <p className="text-red-500 text-xs">{errors.oneLiner?.message?.toString()}</p>}
            </div>
            <div className="space-y-2">
                <Label>About Your Company</Label>
                <Textarea {...register("about")} className="bg-gray-700" />
                <p className="text-xs text-gray-400 text-right">{watch('about', '').length}/1000</p>
                {errors.about && <p className="text-red-500 text-xs">{errors.about?.message?.toString()}</p>}
            </div>
            <div className="flex justify-between items-center mt-6">
                <Button type="button" variant="ghost" onClick={onStartOver} className="text-gray-400">
                    Start Over
                </Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Checking...' : 'Next'}</Button>
            </div>
        </form>
    );
};

const CompanyVerifyPromptStep: React.FC<CompanyVerifyPromptStepProps> = ({ onNext, companyName }) => (
    <div className="space-y-4 text-center">
        <h3 className="text-lg font-semibold">Company Found!</h3>
        <p className="text-gray-400">"{companyName}" is already in our system but has not been verified. To continue, you'll need to verify ownership of the company.</p>
        <Button onClick={onNext}>Proceed to Company Verification</Button>
    </div>
);

const CompanyDetailsStep: React.FC<CompanyDetailsStepProps> = ({ onFormSubmit, onBack, isLoading }) => {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CompanyDetailsFormData>({
        resolver: zodResolver(companyDetailsSchema),
        mode: 'onChange',
        defaultValues: { 
            industry: [] 
        }
    });
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Step 4: Company Details</h3>
            <div className="space-y-2"><Label>Industry (Select all that apply)</Label>
                <Controller 
                    name="industry" 
                    control={control} 
                    render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                            {industries.map(item => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={item} 
                                        checked={field.value.includes(item)} 
                                        onCheckedChange={(checked) => {
                                            const value = Array.isArray(field.value) ? field.value : [];
                                            return checked 
                                                ? field.onChange([...value, item]) 
                                                : field.onChange(value.filter((v) => v !== item));
                                        }} 
                                    />
                                    <Label htmlFor={item} className="font-normal">{item}</Label>
                                </div>
                            ))}
                        </div>
                    )} 
                />
                {errors.industry && <p className="text-red-500 text-xs">{errors.industry.message}</p>}
                {watch('industry')?.includes("Other") && (
                    <div className="space-y-2 pt-2">
                        <Label>Please specify industry</Label>
                        <Input {...register("otherIndustry")} className="bg-gray-700" />
                        {errors.otherIndustry && <p className="text-red-500 text-xs">{errors.otherIndustry.message}</p>}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                    <Label>Primary Company Sector</Label>
                    <Controller 
                        name="primarySector" 
                        control={control} 
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="bg-gray-700">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white">
                                    <SelectItem value="Edtech">Edtech</SelectItem>
                                    <SelectItem value="Fintech">Fintech</SelectItem>
                                    <SelectItem value="AI">AI</SelectItem>
                                    <SelectItem value="SaaS">SaaS</SelectItem>
                                    <SelectItem value="Deep Tech">Deep Tech</SelectItem>
                                </SelectContent>
                            </Select>
                        )} 
                    />
                    {errors.primarySector && <p className="text-red-500 text-xs">{errors.primarySector.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Primary Business Model</Label>
                    <Controller 
                        name="businessModel" 
                        control={control} 
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="bg-gray-700">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white">
                                    <SelectItem value="B2B">B2B</SelectItem>
                                    <SelectItem value="B2C">B2C</SelectItem>
                                    <SelectItem value="D2C">D2C</SelectItem>
                                    <SelectItem value="B2B2C">B2B2C</SelectItem>
                                </SelectContent>
                            </Select>
                        )} 
                    />
                    {errors.businessModel && <p className="text-red-500 text-xs">{errors.businessModel.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Company Stage</Label>
                    <Controller 
                        name="stage" 
                        control={control} 
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="bg-gray-700">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white">
                                    <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                                    <SelectItem value="Seed">Seed</SelectItem>
                                    <SelectItem value="Series A">Series A</SelectItem>
                                    <SelectItem value="Series B+">Series B+</SelectItem>
                                </SelectContent>
                            </Select>
                        )} 
                    />
                    {errors.stage && <p className="text-red-500 text-xs">{errors.stage.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Input type="number" {...register("teamSize")} className="bg-gray-700" />
                    {errors.teamSize && <p className="text-red-500 text-xs">{errors.teamSize.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label>Location(s)</Label>
                <Input {...register("locations")} placeholder="e.g. New York, London" className="bg-gray-700" />
                <p className="text-xs text-gray-400">Separate multiple locations with commas.</p>
                {errors.locations && <p className="text-red-500 text-xs">{errors.locations.message}</p>}
            </div>
            <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onBack}>Back</Button>
                <Button type="submit" disabled={isLoading}>Next</Button>
            </div>
        </form>
    );
};

const FundingHistoryStep: React.FC<FundingHistoryStepProps> = ({ onFormSubmit, onBack, isLoading }) => {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FundingHistoryFormData>({
        resolver: zodResolver(fundingHistorySchema),
        mode: 'onChange',
        defaultValues: {
            hasRaised: "no",
            currency: "INR"
        }
    });

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Step 5: Funding History</h3>
            <div className="space-y-2">
                <Label>Have you raised external funding?</Label>
                <Controller 
                    name="hasRaised" 
                    control={control} 
                    render={({ field }) => (
                        <RadioGroup 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            className="flex space-x-4 pt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="yes" />
                                <Label htmlFor="yes" className="font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="no" />
                                <Label htmlFor="no" className="font-normal">No</Label>
                            </div>
                        </RadioGroup>
                    )} 
                />
                {errors.hasRaised && <p className="text-red-500 text-xs">{errors.hasRaised.message}</p>}
            </div>
            {watch('hasRaised') === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-gray-700">
                    <div className="space-y-2 md:col-span-2">
                        <Label>Total Funding Raised</Label>
                        <div className="flex items-center gap-2">
                            <Controller 
                                name="currency" 
                                control={control} 
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="bg-gray-700 w-[100px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 text-white">
                                            <SelectItem value="INR">₹ INR</SelectItem>
                                            <SelectItem value="USD">$ USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} 
                            />
                            <Input type="number" {...register("totalRaised")} className="bg-gray-700" />
                        </div>
                        {errors.totalRaised && <p className="text-red-500 text-xs">{errors.totalRaised.message}</p>}
                        {errors.currency && <p className="text-red-500 text-xs">{errors.currency.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Number of Funding Rounds</Label>
                        <Input type="number" {...register("rounds")} className="bg-gray-700" />
                        {errors.rounds && <p className="text-red-500 text-xs">{errors.rounds.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Latest Funding Round</Label>
                        <Controller 
                            name="latestRound" 
                            control={control} 
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="bg-gray-700">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 text-white">
                                        <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                                        <SelectItem value="Seed">Seed</SelectItem>
                                        <SelectItem value="Series A">Series A</SelectItem>
                                        <SelectItem value="Series B">Series B</SelectItem>
                                        <SelectItem value="Series C+">Series C+</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} 
                        />
                        {errors.latestRound && <p className="text-red-500 text-xs">{errors.latestRound.message}</p>}
                    </div>
                </div>
            )}
            <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onBack}>Back</Button>
                <Button type="submit" disabled={isLoading}>Next</Button>
            </div>
        </form>
    );
};

const CompanyContactStep: React.FC<CompanyContactStepProps> = ({ onFormSubmit, onBack, isLoading }) => {
    const { register, handleSubmit, control, formState: { errors } } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        mode: 'onChange',
        defaultValues: {
            contactPhone: { countryCode: "+91" }
        }
    });
    const [emailValidation, setEmailValidation] = useState<EmailValidation>({ 
        status: 'checking' as const, 
        message: '' 
    });

    const handleCompanyEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const email = e.target.value;
        const emailSchema = z.string().email("Invalid email address");
        const validationResult = emailSchema.safeParse(email);
        
        if (!validationResult.success) {
            setEmailValidation({ status: 'invalid', message: 'Please enter a valid email address.' });
            return;
        }

        setEmailValidation({ status: 'checking', message: 'Checking email...' });
        try {
            const response = await fetch('/api/company/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyEmail: email }),
            });
            const data = await response.json();
            if (data.exists) {
                setEmailValidation({ status: 'invalid', message: 'This email is already registered.' });
            } else {
                setEmailValidation({ status: 'valid', message: 'This email is available.' });
            }
        } catch (error) {
            setEmailValidation({ status: 'invalid', message: 'Could not verify email. Please try again.' });
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Step 6: Company Contact</h3>
            <div className="space-y-2">
                <Label>Company's Work Email</Label>
                <Input 
                    type="email" 
                    {...register("contactEmail")} 
                    onBlur={handleCompanyEmailBlur}
                    className="bg-gray-700" 
                />
                {errors.contactEmail && <p className="text-red-500 text-xs">{errors.contactEmail.message}</p>}
                {emailValidation.status === 'checking' && <p className="text-xs text-gray-400">{emailValidation.message}</p>}
                {emailValidation.status === 'valid' && <p className="text-xs text-green-500">{emailValidation.message}</p>}
                {emailValidation.status === 'invalid' && <p className="text-xs text-red-500">{emailValidation.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>Company's Phone Number</Label>
                <div className="flex items-center gap-2">
                    <Controller 
                        name="contactPhone.countryCode" 
                        control={control} 
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="bg-gray-700 w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white">
                                    <SelectItem value="+91">IN (+91)</SelectItem>
                                    <SelectItem value="+1">US (+1)</SelectItem>
                                </SelectContent>
                            </Select>
                        )} 
                    />
                    <Input 
                        type="tel" 
                        {...register("contactPhone.number")} 
                        className="bg-gray-700" 
                    />
                </div>
                {errors.contactPhone?.number && <p className="text-red-500 text-xs">{errors.contactPhone.number.message}</p>}
            </div>
            <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onBack}>Back</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Finish & Submit'}
                </Button>
            </div>
        </form>
    );
};

const CompanyOtpVerificationStep: React.FC<CompanyOtpVerificationStepProps> = ({ onOtpSubmit, isLoading, companyEmail, onResendOtp }) => {
    const { control, handleSubmit, formState: { errors } } = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" }
    });
    const [cooldown, setCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);
    
    const handleResend = async () => {
        setCooldown(60);
        setResendStatus('loading');
        try {
            await onResendOtp();
            setResendStatus('success');
        } catch (error) {
            setResendStatus('error');
            setCooldown(0);
        }
    };
    return (
        <form onSubmit={handleSubmit(onOtpSubmit)}>
            <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">Verify Your Company's Email</h3>
                <p className="text-gray-400">An OTP has been sent to your company's email address: <span className="font-semibold text-primary">{companyEmail}</span>.</p>
                <div className="flex justify-center"><Controller name="otp" control={control} render={({ field }) => (<InputOTP maxLength={6} {...field}><InputOTPGroup>{[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP>)} /></div>
                {errors.otp && <p className="text-red-500 text-xs">{errors.otp.message}</p>}
                <Button type="submit" disabled={isLoading} className="w-full max-w-xs mx-auto">{isLoading ? 'Verifying...' : 'Verify Company'}</Button>
                <div className="mt-4 text-sm">
                    <p className="text-gray-400">Didn't receive the code?{' '}
                        <Button type="button" variant="link" className="p-0 h-auto" disabled={cooldown > 0} onClick={handleResend}>
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                        </Button>
                    </p>
                    {resendStatus === 'success' && <p className="text-green-500 text-xs">A new OTP has been sent.</p>}
                    {resendStatus === 'error' && <p className="text-red-500 text-xs">Failed to resend OTP. Please try again.</p>}
                </div>
            </div>
        </form>
    );
};

const SuccessStep: React.FC<SuccessStepProps> = ({ message }) => {
    return (
        <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold text-green-400">
                Onboarding Complete!
            </h3>
            <p className="text-gray-400">{message}</p>
        </div>
    );
};

// --- Main Onboarding Component ---
const CompanyOnboarding: React.FC = () => {
    const steps = ['userAccount', 'otpVerification', 'companyProfile', 'companyVerifyPrompt', 'companyDetails', 'fundingHistory', 'companyContact', 'companyOtpVerification', 'success'] as const;
    type StepType = typeof steps[number];

    // Optional email guard
    const ensureEmail = (email: string | undefined): string => {
        if (!email) throw new Error('Email is required');
        return email;
    }

    // Optional company data guard
    const ensureCompanyData = (companyData: OnboardingData['company']): NonNullable<OnboardingData['company']> => {
        if (!companyData) throw new Error('Company data is required');
        return companyData;
    };
    
    const [currentStep, setCurrentStep] = useState<StepType>('userAccount');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
    const [emailValidation, setEmailValidation] = useState<EmailValidation>({
        status: 'checking',
        message: ''
    });

    const handleEmailBlur = async (email: string) => {
        const emailSchema = z.string().email("Invalid email address");
        const validationResult = emailSchema.safeParse(email);
        
        if (!validationResult.success) {
            setEmailValidation({ 
                status: 'invalid', 
                message: 'Please enter a valid email address.' 
            });
            return;
        }

        setEmailValidation({ 
            status: 'checking', 
            message: 'Checking email...' 
        });
        try {
            const response = await fetch('/api/company/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyEmail: email }),
            });
            const data = await response.json();
            if (data.exists) {
                setEmailValidation({ status: 'invalid', message: 'This email is already registered.' });
            } else {
                setEmailValidation({ status: 'valid', message: 'This email is available.' });
            }
        } catch (error) {
            setEmailValidation({ status: 'invalid', message: 'Could not verify email. Please try again.' });
        }
    };
    const [successMessage, setSuccessMessage] = useState('');

    const moveStep = (nextStep: StepType) => {
        if (steps.includes(nextStep)) {
            setCurrentStep(nextStep);
        }
    };

    const handleUserAccountSubmit = async (data: UserAccountFormData) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, userType: 'company' })
            });
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || 'An error occurred.');
            }

            setOnboardingData({ 
                user: { 
                    ...data,
                    userId: result.userId
                }
            });

            switch (result.status) {
                case 'NEW_USER':
                case 'USER_OTP_RESENT':
                    moveStep('otpVerification');
                    break;
                case 'CONTINUE_PROFILE':
                    moveStep('companyProfile');
                    break;
                case 'VERIFY_COMPANY':
                    // We need to store the company email from the response to show it on the verification screen
                    setOnboardingData(prev => ({ ...prev, company: { ...prev.company, contactEmail: result.companyEmail } }));
                    moveStep('companyOtpVerification');
                    break;
                case 'ONBOARDING_COMPLETE':
                    setSuccessMessage("Your account is already fully set up. You can log in.");
                    moveStep('success');
                    break;
                default:
                    setError("An unexpected error occurred. Please try again.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };
    const handleOtpSubmit = async (data: OtpFormData) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: onboardingData.user?.email,
                    otp: data.otp
                })
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to verify OTP.');
            }
            moveStep('companyProfile');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleOtpBackToAccount = () => {
        // Allow user to go back and correct their account information
        setCurrentStep('userAccount');
        setOnboardingData({});
        setError('');
    };

    const handleStartOver = () => {
        // Completely restart the onboarding process
        setCurrentStep('userAccount');
        setOnboardingData({});
        setError('');
        setEmailValidation({
            status: 'checking',
            message: ''
        });
    };
    const handleCompanyProfileSubmit = async (data: CompanyProfileFormData) => {
        setLoading(true);
        setError('');
        const updatedData = {
            ...onboardingData,
            company: data
        };
        setOnboardingData(updatedData);
        try {
            const res = await fetch('/api/company/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: 'checkCompany',
                    email: updatedData.user?.email,
                    companyWebsite: data.companyWebsite
                })
            });
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || 'Failed to check company.');
            }
            switch(result.status) {
                case 'COMPANY_ALREADY_VERIFIED':
                    setSuccessMessage("This company is already verified. Please log in or contact support.");
                    moveStep('success');
                    break;
                case 'COMPANY_EXISTS_UNVERIFIED':
                    setOnboardingData(d => ({
                        ...d,
                        company: {
                            ...d.company,
                            companyId: result.companyId
                        }
                    }));
                    moveStep('companyVerifyPrompt');
                    break;
                case 'COMPANY_DOES_NOT_EXIST':
                    moveStep('companyDetails');
                    break;
                default:
                    throw new Error('Received an unexpected response from the server.');
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyDetailsSubmit = async (data: CompanyDetailsFormData) => {
        const finalIndustry = data.industry.includes("Other") && data.otherIndustry 
            ? [data.otherIndustry]
            : data.industry;

        const details = {
            ...data,
            industry: finalIndustry
        };

        delete details.otherIndustry;

        setOnboardingData(prev => ({
            ...prev,
            company: {
                ...prev.company,
                ...details
            }
        }));

        moveStep('fundingHistory');
    };
    const handleFundingHistorySubmit = async (data: FundingHistoryFormData) => {
        setOnboardingData(prev => ({
            ...prev,
            company: {
                ...prev.company,
                funding: data
            }
        }));
        moveStep('companyContact');
    };

    const handleCompanyContactSubmit = async (data: ContactFormData) => {
        setLoading(true);
        setError('');

        const finalData = {
            ...onboardingData,
            company: {
                ...onboardingData.company,
                ...data
            }
        };

        setOnboardingData(finalData);

        try {
            const createRes = await fetch('/api/company/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: 'createCompany',
                    email: finalData.user?.email,
                    companyData: finalData.company
                })
            });

            const createResult = await createRes.json();
            if (!createRes.ok) {
                throw new Error(createResult.error || 'Failed to create company profile.');
            }

            const newCompanyId = createResult.companyId;
            setOnboardingData(d => ({
                ...d,
                company: {
                    ...d.company,
                    companyId: newCompanyId
                }
            }));

            const sendOtpRes = await fetch('/api/company/send-verification-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: newCompanyId })
            });

            if (!sendOtpRes.ok) {
                const otpError = await sendOtpRes.json();
                throw new Error(otpError.error || "Failed to send company verification OTP.");
            }

            moveStep('companyOtpVerification');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };
    const handleCompanyOtpSubmit = async (data: OtpFormData) => {
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch('/api/company/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: onboardingData.company?.companyId,
                    otp: data.otp
                })
            });
            
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to verify company OTP.');
            }
            
            setSuccessMessage("Your company has been successfully verified!");
            moveStep('success');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyResendOtp = async (): Promise<void> => {
        setError('');
        try {
            const res = await fetch('/api/company/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: onboardingData.company?.companyId
                })
            });
            
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to resend OTP.');
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            throw err;
        }
    };

    const handleResendOtp = async (): Promise<void> => {
        setError('');
        try {
            const res = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: onboardingData.user?.email
                })
            });
            
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to resend OTP.');
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            throw err;
        }
    };

    const renderCurrentStep = () => {
        try {
            switch (currentStep) {
                case 'userAccount':
                    return (
                        <UserAccountStep 
                            onFormSubmit={handleUserAccountSubmit} 
                            isLoading={loading} 
                            onEmailBlur={handleEmailBlur} 
                            emailValidation={emailValidation} 
                        />
                    );

                case 'otpVerification': {
                    const email = ensureEmail(onboardingData.user?.email);
                    return (
                        <OtpVerificationStep 
                            onOtpSubmit={handleOtpSubmit} 
                            isLoading={loading} 
                            userEmail={email} 
                            onResendOtp={handleResendOtp} 
                            onBack={handleOtpBackToAccount} 
                        />
                    );
                }

                case 'companyProfile':
                    return (
                        <CompanyProfileStep 
                            onFormSubmit={handleCompanyProfileSubmit} 
                            onBack={() => {}} 
                            isLoading={loading} 
                            onStartOver={handleStartOver} 
                        />
                    );

                case 'companyVerifyPrompt': {
                    const companyData = ensureCompanyData(onboardingData.company);
                    return (
                        <CompanyVerifyPromptStep 
                            onNext={() => moveStep('companyOtpVerification')} 
                            companyName={companyData.companyName || 'Unknown Company'} 
                        />
                    );
                }

                case 'companyDetails':
                    return (
                        <CompanyDetailsStep 
                            onFormSubmit={handleCompanyDetailsSubmit} 
                            onBack={() => moveStep('companyProfile')} 
                            isLoading={loading} 
                        />
                    );

                case 'fundingHistory':
                    return (
                        <FundingHistoryStep 
                            onFormSubmit={handleFundingHistorySubmit} 
                            onBack={() => moveStep('companyDetails')} 
                            isLoading={loading} 
                        />
                    );

                case 'companyContact':
                    return (
                        <CompanyContactStep 
                            onFormSubmit={handleCompanyContactSubmit} 
                            onBack={() => moveStep('fundingHistory')} 
                            isLoading={loading} 
                        />
                    );

                case 'companyOtpVerification': {
                    const companyData = ensureCompanyData(onboardingData.company);
                    const email = ensureEmail(companyData.contactEmail);
                    return (
                        <CompanyOtpVerificationStep 
                            onOtpSubmit={handleCompanyOtpSubmit} 
                            isLoading={loading} 
                            companyEmail={email} 
                            onResendOtp={handleCompanyResendOtp} 
                        />
                    );
                }

                case 'success':
                    return <SuccessStep message={successMessage} />;

                default:
                    return (
                        <UserAccountStep 
                            onFormSubmit={handleUserAccountSubmit} 
                            isLoading={loading} 
                            onEmailBlur={handleEmailBlur} 
                            emailValidation={emailValidation} 
                        />
                    );
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            // If there's an error rendering any step, revert to user account step
            setCurrentStep('userAccount');
            return null;
        }
    };

    return (
        <div className="w-full"><Card className="w-full bg-transparent text-white border-0 shadow-none">
            <CardHeader className="text-center p-0 mb-6"><CardTitle className="text-2xl sm:text-3xl font-bold">Company Onboarding</CardTitle><p className="text-gray-400">Let's get you and your company set up.</p></CardHeader>
            <CardContent className="p-0">{renderCurrentStep()}{error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}</CardContent>
        </Card></div>
    );
};

export default CompanyOnboarding;

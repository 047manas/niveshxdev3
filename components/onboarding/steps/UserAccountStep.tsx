"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userAccountSchema } from "@/types/schemas/account";
import type { UserAccountFormData, EmailValidation } from "@/types/forms";
import { useCompanyOnboarding } from '@/context/CompanyOnboardingContext';
import { Loader2 } from 'lucide-react';

interface UserAccountStepProps {
    onFormSubmit: (data: UserAccountFormData) => Promise<void>;
}

export const UserAccountStep: React.FC<UserAccountStepProps> = ({ onFormSubmit }) => {
    const { state, dispatch } = useCompanyOnboarding();
    const { register, handleSubmit, control, formState: { errors } } = useForm<UserAccountFormData>({
        resolver: zodResolver(userAccountSchema),
        mode: 'onChange',
        defaultValues: state.userAccount || {
            phone: { countryCode: "+91" }
        }
    });

    const [emailValidation, setEmailValidation] = useState<EmailValidation>({ status: 'idle', message: '' });

    const handleEmailBlur = async (email: string) => {
        const emailSchema = z.string().email("Invalid email address");
        const validationResult = emailSchema.safeParse(email);

        if (!validationResult.success) {
            setEmailValidation({ status: 'invalid', message: 'Please enter a valid email address.' });
            return;
        }

        setEmailValidation({ status: 'checking', message: 'Checking email...' });
        try {
            const response = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
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

    const onSubmit = (data: UserAccountFormData) => {
        dispatch({ type: 'SET_USER_ACCOUNT', payload: data });
        onFormSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
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
                            onBlur={(e) => handleEmailBlur(e.target.value)}
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
                disabled={state.isLoading}
                className="w-full mt-8 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 transition-all duration-200 font-medium py-2.5"
            >
                {state.isLoading ? (
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

"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import type { OtpFormData } from "@/types/forms";

const otpSchema = z.object({
  otp: z.string().min(6, "Your OTP must be 6 characters."),
});

interface OtpStepProps {
  title: string;
  description: string;
  email: string;
  isLoading: boolean;
  onOtpSubmit: (data: OtpFormData) => Promise<void>;
  onResendOtp: () => Promise<void>;
  onBack?: () => void;
}

export const OtpStep: React.FC<OtpStepProps> = ({ title, description, email, isLoading, onOtpSubmit, onResendOtp, onBack }) => {
    const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
    const [cooldown, setCooldown] = useState(60);
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        const timer = setInterval(() => {
            setCooldown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleResend = async () => {
        if (cooldown > 0) return;
        setResendStatus('loading');
        try {
            await onResendOtp();
            setResendStatus('success');
            setCooldown(60);
        } catch (error) {
            setResendStatus('error');
        }
    };

    return (
        <form onSubmit={handleSubmit(onOtpSubmit)}>
            <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-gray-400">{description} <span className="font-semibold text-primary">{email}</span>.</p>
                {onBack && (
                    <p className="text-sm text-gray-500">
                        Need to change your details? You can go back.
                    </p>
                )}
                <div className="flex justify-center">
                    <Controller name="otp" control={control} render={({ field }) => (<InputOTP maxLength={6} {...field}><InputOTPGroup>{[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP>)} />
                </div>
                {errors.otp && <p className="text-red-500 text-xs">{errors.otp.message}</p>}
                <div className="flex justify-center gap-4 mt-6">
                    {onBack && (
                        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                            Back
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading} className="px-8">
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                </div>
                <div className="mt-4 text-sm">
                    <p className="text-gray-400">
                        Didn't receive the code?{' '}
                        <Button type="button" variant="link" className="p-0 h-auto" disabled={cooldown > 0 || resendStatus === 'loading'} onClick={handleResend}>
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

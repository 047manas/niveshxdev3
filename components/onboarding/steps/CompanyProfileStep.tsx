"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { companyProfileSchema } from "@/lib/schemas/company";
import type { CompanyProfileFormData } from "@/types/forms";
import { useCompanyOnboarding } from '@/context/CompanyOnboardingContext';

interface CompanyProfileStepProps {
    onFormSubmit: (data: CompanyProfileFormData) => Promise<void>;
    onStartOver: () => void;
}

export const CompanyProfileStep: React.FC<CompanyProfileStepProps> = ({ onFormSubmit, onStartOver }) => {
    const { state, dispatch } = useCompanyOnboarding();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<CompanyProfileFormData>({
        resolver: zodResolver(companyProfileSchema),
        mode: 'onChange',
        defaultValues: state.companyProfile
    });

    const onSubmit = (data: CompanyProfileFormData) => {
        dispatch({ type: 'SET_COMPANY_PROFILE', payload: data });
        onFormSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="button" variant="ghost" onClick={onStartOver} className="text-gray-400" disabled={state.isLoading}>
                    Start Over
                </Button>
                <Button type="submit" disabled={state.isLoading}>{state.isLoading ? 'Checking...' : 'Next'}</Button>
            </div>
        </form>
    );
};

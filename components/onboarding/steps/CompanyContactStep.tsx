"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { contactSchema } from "@/types/schemas/account";
import type { ContactFormData, EmailValidation } from "@/types/forms";
import { useCompanyOnboarding } from '@/context/CompanyOnboardingContext';

interface CompanyContactStepProps {
    onFormSubmit: (data: ContactFormData) => Promise<void>;
}

export const CompanyContactStep: React.FC<CompanyContactStepProps> = ({ onFormSubmit }) => {
    const { state, dispatch } = useCompanyOnboarding();
    const { register, handleSubmit, control, formState: { errors } } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        mode: 'onChange',
        defaultValues: state.companyContact || {
            contactPhone: { countryCode: "+91" }
        }
    });
    const [emailValidation, setEmailValidation] = useState<EmailValidation>({ status: 'idle', message: '' });

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

    const onSubmit = (data: ContactFormData) => {
        dispatch({ type: 'SET_COMPANY_CONTACT', payload: data });
        onFormSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <Button type="button" variant="outline" onClick={() => dispatch({ type: 'PREV_STEP' })} disabled={state.isLoading}>Back</Button>
                <Button type="submit" disabled={state.isLoading}>
                    {state.isLoading ? 'Submitting...' : 'Finish & Submit'}
                </Button>
            </div>
        </form>
    );
};

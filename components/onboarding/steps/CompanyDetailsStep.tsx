"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { industries, companyDetailsSchema } from "@/lib/schemas/company";
import type { CompanyDetailsFormData } from "@/types/forms";
import { useCompanyOnboarding } from '@/context/CompanyOnboardingContext';

export const CompanyDetailsStep: React.FC = () => {
    const { state, dispatch } = useCompanyOnboarding();
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CompanyDetailsFormData>({
        resolver: zodResolver(companyDetailsSchema),
        mode: 'onChange',
        defaultValues: state.companyDetails || {
            industry: []
        }
    });

    const onSubmit = (data: CompanyDetailsFormData) => {
        dispatch({ type: 'SET_COMPANY_DETAILS', payload: data });
        dispatch({ type: 'NEXT_STEP' });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <Button type="button" variant="outline" onClick={() => dispatch({ type: 'PREV_STEP' })} disabled={state.isLoading}>Back</Button>
                <Button type="submit" disabled={state.isLoading}>Next</Button>
            </div>
        </form>
    );
};

"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fundingHistorySchema } from "@/lib/schemas/company";
import type { FundingHistoryFormData } from "@/types/forms";
import { useCompanyOnboarding } from '@/context/CompanyOnboardingContext';

export const FundingHistoryStep: React.FC = () => {
    const { state, dispatch } = useCompanyOnboarding();
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FundingHistoryFormData>({
        resolver: zodResolver(fundingHistorySchema),
        mode: 'onChange',
        defaultValues: state.fundingHistory || {
            hasRaised: "no",
            currency: "INR"
        }
    });

    const onSubmit = (data: FundingHistoryFormData) => {
        dispatch({ type: 'SET_FUNDING_HISTORY', payload: data });
        dispatch({ type: 'NEXT_STEP' });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <Button type="button" variant="outline" onClick={() => dispatch({ type: 'PREV_STEP' })} disabled={state.isLoading}>Back</Button>
                <Button type="submit" disabled={state.isLoading}>Next</Button>
            </div>
        </form>
    );
};

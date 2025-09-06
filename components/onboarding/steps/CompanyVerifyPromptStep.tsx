"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useCompanyOnboarding } from '@/context/CompanyOnboardingContext';

export const CompanyVerifyPromptStep: React.FC = () => {
    const { state, dispatch } = useCompanyOnboarding();

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">Company Found!</h3>
            <p className="text-gray-400">"{state.companyProfile.companyName}" is already in our system but has not been verified. To continue, you'll need to verify ownership of the company.</p>
            <Button onClick={() => dispatch({ type: 'SET_STEP', payload: 7 })}>Proceed to Company Verification</Button>
        </div>
    );
};

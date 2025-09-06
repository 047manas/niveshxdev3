"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyOnboardingProvider, useCompanyOnboarding } from '@/context/CompanyOnboardingContext';
import * as apiClient from '@/lib/api-client';

// Import all step components
import { UserAccountStep } from './steps/UserAccountStep';
import { OtpStep } from './steps/OtpStep';
import { CompanyProfileStep } from './steps/CompanyProfileStep';
import { CompanyVerifyPromptStep } from './steps/CompanyVerifyPromptStep';
import { CompanyDetailsStep } from './steps/CompanyDetailsStep';
import { FundingHistoryStep } from './steps/FundingHistoryStep';
import { CompanyContactStep } from './steps/CompanyContactStep';
import { SuccessStep } from './steps/SuccessStep';
import { UserAccountFormData, OtpFormData, CompanyProfileFormData, ContactFormData } from '@/types/forms';

const OnboardingFlow: React.FC = () => {
    const { state, dispatch } = useCompanyOnboarding();

    // --- API Handlers ---

    const handleUserAccountSubmit = async (data: UserAccountFormData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await apiClient.registerUser(data);
            dispatch({ type: 'NEXT_STEP' });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'An unexpected error occurred' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleUserOtpSubmit = async (data: OtpFormData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await apiClient.verifyUserOtp(state.userAccount.email!, data.otp);
            dispatch({ type: 'NEXT_STEP' });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'An unexpected error occurred' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleResendUserOtp = async () => {
        await apiClient.resendUserOtp(state.userAccount.email!);
    };

    const handleCompanyProfileSubmit = async (data: CompanyProfileFormData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const result = await apiClient.checkCompany(state.userAccount.email!, data.companyWebsite!);
            switch(result.status) {
                case 'COMPANY_ALREADY_VERIFIED':
                    dispatch({ type: 'SET_STEP', payload: 9 }); // Success step
                    break;
                case 'COMPANY_EXISTS_UNVERIFIED':
                    dispatch({ type: 'SET_COMPANY_ID', payload: result.companyId });
                    dispatch({ type: 'SET_STEP', payload: 4 }); // Prompt step
                    break;
                case 'COMPANY_DOES_NOT_EXIST':
                    dispatch({ type: 'NEXT_STEP' });
                    break;
                default:
                    throw new Error('Received an unexpected response from the server.');
            }
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'An unexpected error occurred' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleCompanyContactSubmit = async (data: ContactFormData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const companyData = {
            ...state.companyProfile,
            ...state.companyDetails,
            ...state.fundingHistory,
            ...data
        };

        try {
            const createResult = await apiClient.createCompany(state.userAccount.email!, companyData);
            const companyId = createResult.companyId;
            dispatch({ type: 'SET_COMPANY_ID', payload: companyId });
            await apiClient.sendCompanyVerificationOtp(companyId);
            dispatch({ type: 'SET_STEP', payload: 8 }); // Company OTP step
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'An unexpected error occurred' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleCompanyOtpSubmit = async (data: OtpFormData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await apiClient.verifyCompanyOtp(state.companyId!, data.otp);
            dispatch({ type: 'SET_STEP', payload: 9 }); // Success step
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'An unexpected error occurred' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleResendCompanyOtp = async () => {
        await apiClient.resendCompanyOtp(state.companyId!);
    };

    const renderCurrentStep = () => {
        switch (state.step) {
            case 1:
                return <UserAccountStep onFormSubmit={handleUserAccountSubmit} />;
            case 2:
                return <OtpStep
                    title="Verify Your Email"
                    description="An OTP has been sent to"
                    email={state.userAccount.email!}
                    isLoading={state.isLoading}
                    onOtpSubmit={handleUserOtpSubmit}
                    onResendOtp={handleResendUserOtp}
                    onBack={() => dispatch({ type: 'PREV_STEP' })}
                />;
            case 3:
                return <CompanyProfileStep onFormSubmit={handleCompanyProfileSubmit} onStartOver={() => dispatch({ type: 'RESET' })} />;
            case 4:
                return <CompanyVerifyPromptStep />;
            case 5:
                return <CompanyDetailsStep />;
            case 6:
                return <FundingHistoryStep />;
            case 7:
                return <CompanyContactStep onFormSubmit={handleCompanyContactSubmit} />;
            case 8:
                return <OtpStep
                    title="Verify Your Company's Email"
                    description="An OTP has been sent to your company's email address:"
                    email={state.companyContact.contactEmail!}
                    isLoading={state.isLoading}
                    onOtpSubmit={handleCompanyOtpSubmit}
                    onResendOtp={handleResendCompanyOtp}
                />;
            case 9:
                return <SuccessStep message="Your company has been successfully created and verified!" />;
            default:
                return <UserAccountStep onFormSubmit={handleUserAccountSubmit} />;
        }
    };

    return (
        <Card className="w-full bg-transparent text-white border-0 shadow-none">
            <CardHeader className="text-center p-0 mb-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold">Company Onboarding</CardTitle>
                <p className="text-gray-400">Let's get you and your company set up.</p>
            </CardHeader>
            <CardContent className="p-0">
                {renderCurrentStep()}
                {state.error && <p className="mt-4 text-center text-sm text-red-500">{state.error}</p>}
            </CardContent>
        </Card>
    );
};

const CompanyOnboarding: React.FC = () => {
    return (
        <CompanyOnboardingProvider>
            <OnboardingFlow />
        </CompanyOnboardingProvider>
    );
};

export default CompanyOnboarding;

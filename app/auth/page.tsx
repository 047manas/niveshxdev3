"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Login from '@/components/main/Login';
import SignUp from '@/components/main/SignUp';
import VerifyOtp from '@/components/main/VerifyOtp';
import ForgotPassword from '@/components/main/ForgotPassword';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';

const AuthFlow = () => {
  const [view, setView] = useState('login');
  const [userType, setUserType] = useState('company');
  const searchParams = useSearchParams();
  const { resetFormState } = useOnboarding();

  useEffect(() => {
    const viewParam = searchParams.get('view');
    const userTypeParam = searchParams.get('userType');

    if (viewParam) {
      setView(viewParam);
    }
    if (userTypeParam) {
      setUserType(userTypeParam);
    }
  }, [searchParams]);

  const handleUserTypeChange = (newUserType: 'company' | 'investor') => {
    setUserType(newUserType);
    resetFormState();
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login setCurrentView={setView} />;
      case 'signup':
        return (
          <SignUp
            setCurrentView={setView}
            userType={userType}
            setUserType={handleUserTypeChange}
          />
        );
      case 'verify-otp':
        return <VerifyOtp setCurrentView={setView} />;
      case 'forgot-password':
        return <ForgotPassword setCurrentView={setView} />;
      default:
        // Default to signup, passing the view setter
        return <SignUp setCurrentView={setView} userType={userType} setUserType={handleUserTypeChange} />;
    }
  };

  return <div>{renderView()}</div>;
};

const AuthPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingProvider>
        <AuthFlow />
      </OnboardingProvider>
    </Suspense>
  );
};

export default AuthPage;

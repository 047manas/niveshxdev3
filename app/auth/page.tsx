"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Login from '@/components/main/Login';
import SignUp from '@/components/main/SignUp';
import VerifyOtp from '@/components/main/VerifyOtp';
import ForgotPassword from '@/components/main/ForgotPassword';

const AuthFlow = () => {
  const [view, setView] = useState('login');
  const [userType, setUserType] = useState('company');
  const [emailToVerify, setEmailToVerify] = useState('');
  const searchParams = useSearchParams();

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

  const handleRegistrationSuccess = (email: string) => {
    setEmailToVerify(email);
    setView('verify-otp');
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
            setUserType={setUserType}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      case 'verify-otp':
        return <VerifyOtp email={emailToVerify} setCurrentView={setView} />;
      case 'forgot-password':
        return <ForgotPassword setCurrentView={setView} />;
      default:
        return <Login setCurrentView={setView} />;
    }
  };

  return (
    <div>
      {renderView()}
    </div>
  );
};

const AuthPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthFlow />
    </Suspense>
  );
};

export default AuthPage;

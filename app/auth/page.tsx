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
  const [step, setStep] = useState(1); // For company registration
  const [investorStep, setInvestorStep] = useState(1); // For investor registration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    linkedinProfile: '',
    countryCode: '+91',
    phoneNumber: '',
    investorType: '',
    chequeSize: '',
    interestedSectors: '',
    designation: '',
    companyName: '',
    companyStage: '',
    latestValuation: '',
    shareType: [],
    dealSize: '',
  });

  const handleChange = (input) => (e) => {
    setFormData({ ...formData, [input]: e.target.value });
  };

  const handleSelectChange = (input) => (value) => {
    setFormData({ ...formData, [input]: value });
  };

  const handleShareTypeChange = (value) => {
    setFormData({ ...formData, shareType: value });
  };

  const resetFormState = () => {
      setStep(1);
      setInvestorStep(1);
      setError('');
  }

  const handleUserTypeChange = (newUserType) => {
      setUserType(newUserType);
      resetFormState();
  }

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
            step={step}
            setStep={setStep}
            investorStep={investorStep}
            setInvestorStep={setInvestorStep}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleShareTypeChange={handleShareTypeChange}
          />
        );
      case 'verify-otp':
        return <VerifyOtp setCurrentView={setView} />;
      case 'forgot-password':
        return <ForgotPassword setCurrentView={setView} />;
      default:
        return <SignUp setCurrentView={setView} />;
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

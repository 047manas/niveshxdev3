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
    // Step 1: Create Your Account
    firstName: '',
    lastName: '',
    designation: '',
    linkedinProfile: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2: Company Profile
    companyName: '',
    companyWebsite: '',
    companyLinkedIn: '',
    oneLinerPitch: '',
    aboutCompany: '',

    // Step 3: Company Details
    industry: [],
    primaryCompanySector: '',
    primaryBusinessModel: '',
    companyStage: '',
    teamSize: '',
    locations: [],

    // Step 4: Funding History
    hasRaisedFunding: 'no',
    totalFundingRaised: '',
    fundingCurrency: 'INR',
    numberOfFundingRounds: '',
    latestFundingRound: '',

    // Step 5: Company Contact
    companyWorkEmail: '',
    companyPhoneCountryCode: '+91',
    companyPhoneNumber: '',

    // Investor fields (unchanged)
    investorType: '',
    chequeSize: '',
    interestedSectors: '',
    countryCode: '+91',
    phoneNumber: '',
  });

  const handleChange = (input) => (e) => {
    const value = e.target.type === 'checkbox' ?
      (e.target.checked ? [...(formData[input] || []), e.target.value] : formData[input].filter(v => v !== e.target.value))
      : e.target.value;
    setFormData({ ...formData, [input]: value });
  };

  const handleSelectChange = (input) => (value) => {
    setFormData({ ...formData, [input]: value });
  };

  const handleRadioChange = (input) => (e) => {
    setFormData({ ...formData, [input]: e.target.value });
  };

  // This function is for the old toggle group, will be replaced by checkbox handler
  const handleShareTypeChange = (value) => {
    // This can be repurposed or removed if not used elsewhere.
    // For now, let's make it a generic multi-select handler.
    setFormData({ ...formData, industry: value });
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
            handleRadioChange={handleRadioChange}
            setFormData={setFormData}
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

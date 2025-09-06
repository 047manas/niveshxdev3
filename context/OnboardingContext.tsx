"use client";

import React, { createContext, useContext, useState } from 'react';

// Define the shape of the form data
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  linkedinProfile: string;
  countryCode: string;
  phoneNumber: string;
  investorType: string;
  chequeSize: string;
  interestedSectors: string;
  designation: string;
  companyName: string;
  companyStage: string;
  latestValuation: string;
  shareType: string[];
  investmentType: string[];
}

// Define the shape of the context
interface OnboardingContextType {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  investorStep: number;
  setInvestorStep: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleChange: (input: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (input: keyof FormData) => (value: string) => void;
  handleShareTypeChange: (value: string[]) => void;
  handleInvestmentTypeChange: (value: string) => void;
  resetFormState: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(1);
  const [investorStep, setInvestorStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
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
    investmentType: [],
  });

  const handleChange = (input: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [input]: e.target.value }));
  };

  const handleSelectChange = (input: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [input]: value }));
  };

  const handleShareTypeChange = (value: string[]) => {
    setFormData(prev => ({ ...prev, shareType: value }));
  };

  const handleInvestmentTypeChange = (value: string) => {
    setFormData(prev => {
      let newInvestmentType = [...prev.investmentType];
      const hasEquity = newInvestmentType.includes("Equity investments");
      const hasDebt = newInvestmentType.includes("Debt financing");

      if (value === "Both") {
        if (hasEquity && hasDebt) {
          newInvestmentType = [];
        } else {
          newInvestmentType = ["Equity investments", "Debt financing"];
        }
      } else {
        if (newInvestmentType.includes(value)) {
          newInvestmentType = newInvestmentType.filter(v => v !== value);
        } else {
          newInvestmentType.push(value);
        }
      }
      return { ...prev, investmentType: newInvestmentType };
    });
  };

  const resetFormState = () => {
    setStep(1);
    setInvestorStep(1);
    setError('');
  };

  const value = {
    step,
    setStep,
    investorStep,
    setInvestorStep,
    loading,
    setLoading,
    error,
    setError,
    formData,
    setFormData,
    handleChange,
    handleSelectChange,
    handleShareTypeChange,
    handleInvestmentTypeChange,
    resetFormState,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

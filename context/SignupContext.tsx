"use client";

import React, { createContext, useContext, useState } from 'react';

interface SignupData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  userType: string;
  [key: string]: any;
}

interface SignupContextType {
  signupData: SignupData;
  updateSignupData: (data: Partial<SignupData>) => void;
  clearSignupData: () => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    userType: '',
  });

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...data }));
  };

  const clearSignupData = () => {
    setSignupData({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      userType: '',
    });
  };

  return (
    <SignupContext.Provider value={{ signupData, updateSignupData, clearSignupData }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
}

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import {
  UserAccountFormData,
  CompanyProfileFormData,
  CompanyDetailsFormData,
  FundingHistoryFormData,
  ContactFormData,
} from '@/types/forms';

// --- State and Actions ---

type OnboardingState = {
  step: number;
  userAccount: Partial<UserAccountFormData>;
  companyProfile: Partial<CompanyProfileFormData>;
  companyDetails: Partial<CompanyDetailsFormData>;
  fundingHistory: Partial<FundingHistoryFormData>;
  companyContact: Partial<ContactFormData>;
  companyId?: string;
  error?: string;
  isLoading: boolean;
};

type Action =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_USER_ACCOUNT'; payload: Partial<UserAccountFormData> }
  | { type: 'SET_COMPANY_PROFILE'; payload: Partial<CompanyProfileFormData> }
  | { type: 'SET_COMPANY_DETAILS'; payload: Partial<CompanyDetailsFormData> }
  | { type: 'SET_FUNDING_HISTORY'; payload: Partial<FundingHistoryFormData> }
  | { type: 'SET_COMPANY_CONTACT'; payload: Partial<ContactFormData> }
  | { type: 'SET_COMPANY_ID'; payload: string }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

const initialState: OnboardingState = {
  step: 1,
  userAccount: {},
  companyProfile: {},
  companyDetails: {},
  fundingHistory: {},
  companyContact: {},
  isLoading: false,
};

const onboardingReducer = (state: OnboardingState, action: Action): OnboardingState => {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: state.step - 1 };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_USER_ACCOUNT':
      return { ...state, userAccount: { ...state.userAccount, ...action.payload } };
    case 'SET_COMPANY_PROFILE':
      return { ...state, companyProfile: { ...state.companyProfile, ...action.payload } };
    case 'SET_COMPANY_DETAILS':
      return { ...state, companyDetails: { ...state.companyDetails, ...action.payload } };
    case 'SET_FUNDING_HISTORY':
      return { ...state, fundingHistory: { ...state.fundingHistory, ...action.payload } };
    case 'SET_COMPANY_CONTACT':
        return { ...state, companyContact: { ...state.companyContact, ...action.payload } };
    case 'SET_COMPANY_ID':
        return { ...state, companyId: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// --- Context Definition ---

type CompanyOnboardingContextType = {
  state: OnboardingState;
  dispatch: React.Dispatch<Action>;
};

const CompanyOnboardingContext = createContext<CompanyOnboardingContextType | undefined>(undefined);

// --- Provider Component ---

export const CompanyOnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  return (
    <CompanyOnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </CompanyOnboardingContext.Provider>
  );
};

// --- Custom Hook ---

export const useCompanyOnboarding = () => {
  const context = useContext(CompanyOnboardingContext);
  if (context === undefined) {
    throw new Error('useCompanyOnboarding must be used within a CompanyOnboardingProvider');
  }
  return context;
};

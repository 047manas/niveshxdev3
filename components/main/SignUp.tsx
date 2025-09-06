'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, useWatch, Controller, Control, UseFormRegister, FieldErrors, UseFormSetValue, SubmitHandler } from 'react-hook-form';
import {
  SignUpProps,
  EmailValidation,
} from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { OtpStep } from '@/components/onboarding/steps/OtpStep';
import { sharedStyles } from '@/styles/shared';
import { Loader2 } from 'lucide-react';
import { Building2, User } from "lucide-react";
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";
import * as apiClient from '@/lib/api-client';
import { SignUpFormData, OtpFormData } from '@/types/forms';


// --- Form Schemas ---
const investorStep1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  countryCode: z.string(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  linkedinProfile: z.string().url("Please enter a valid LinkedIn URL").or(z.literal('')),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const investorStep2Schema = z.object({
  investorType: z.enum(["UHNI/HNI", "Family Office", "VC", "Private Equity"]),
  investmentType: z.array(z.string()).min(1, "Please select at least one investment type"),
  chequeSize: z.string().min(1, "Please select a cheque size"),
  interestedSectors: z.string().min(1, "Please list interested sectors")
    .transform(val => val.split(',').map(s => s.trim()).filter(s => s.length > 0))
    .refine(arr => arr.length > 0, { message: "Please list at least one valid sector." }),
});

const allInvestorStepSchemas = [investorStep1Schema, investorStep2Schema];

// Helper component for form errors
const FormError: React.FC<{ error?: { message?: string } | string }> = ({ error }) => {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message;
  return message ? <p className="text-red-500 text-xs">{message}</p> : null;
};

// --- Step Components ---
interface InvestorStep1Props {
  control: Control<SignUpFormData>;
  register: UseFormRegister<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
  onEmailBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  emailValidation: EmailValidation;
}

interface InvestorStep2Props {
  control: Control<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
  setValue: UseFormSetValue<SignUpFormData>;
}

// InvestorStep1 Component
const InvestorStep1: React.FC<InvestorStep1Props> = ({ control, register, errors, onEmailBlur, emailValidation }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div className="space-y-2">
        <Label>First Name</Label>
        <Input {...register("firstName")} className="bg-gray-700" />
        <FormError error={errors.firstName} />
      </div>
      <div className="space-y-2">
        <Label>Last Name</Label>
        <Input {...register("lastName")} className="bg-gray-700" />
        <FormError error={errors.lastName} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Email</Label>
        <Input type="email" {...register("email")} onBlur={onEmailBlur} className="bg-gray-700" />
        <FormError error={errors.email} />
        {emailValidation.status !== 'idle' && (
          <p className={`text-xs ${emailValidation.status === 'valid' ? 'text-green-500' : emailValidation.status === 'checking' ? 'text-yellow-500' : 'text-red-500'}`}>
            {emailValidation.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Phone Country Code</Label>
        <Input {...register("countryCode")} className="bg-gray-700" placeholder="+91" />
        <FormError error={errors.countryCode} />
      </div>
      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input {...register("phoneNumber")} className="bg-gray-700" />
        <FormError error={errors.phoneNumber} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>LinkedIn Profile</Label>
        <Input {...register("linkedinProfile")} className="bg-gray-700" placeholder="https://linkedin.com/in/username" />
        <FormError error={errors.linkedinProfile} />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" {...register("password")} className="bg-gray-700" />
        <FormError error={errors.password} />
      </div>
      <div className="space-y-2">
        <Label>Confirm Password</Label>
        <Input type="password" {...register("confirmPassword")} className="bg-gray-700" />
        <FormError error={errors.confirmPassword} />
      </div>
    </div>
  );
};

// InvestorStep2 Component
const InvestorStep2: React.FC<InvestorStep2Props> = ({ control, errors, setValue }) => {
  const investmentTypes = ['Angel', 'Seed', 'Series A'];
  const chequeSizes = ['25K-50K', '50K-100K', '100K+'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div className="space-y-2 md:col-span-2">
        <Label>Type of Investor</Label>
        <Controller
          name="investorType"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select investor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UHNI/HNI">UHNI/HNI</SelectItem>
                <SelectItem value="Family Office">Family Office</SelectItem>
                <SelectItem value="VC">VC</SelectItem>
                <SelectItem value="Private Equity">Private Equity</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FormError error={errors.investorType} />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label>Investment Type</Label>
        <div className="flex flex-wrap gap-2">
          {investmentTypes.map((type) => (
            <Controller
              key={type}
              name="investmentType"
              control={control}
              render={({ field }) => (
                <Button
                  type="button"
                  variant={field.value?.includes(type) ? "default" : "outline"}
                  onClick={() => {
                    const newValue = field.value?.includes(type)
                      ? field.value.filter((t: string) => t !== type)
                      : [...(field.value || []), type];
                    field.onChange(newValue);
                  }}
                >
                  {type}
                </Button>
              )}
            />
          ))}
        </div>
        <FormError error={errors.investmentType} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Cheque Size</Label>
        <Controller
          name="chequeSize"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select cheque size" />
              </SelectTrigger>
              <SelectContent>
                {chequeSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormError error={errors.chequeSize} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Sectors of Interest</Label>
        <Controller
          name="interestedSectors"
          control={control}
          render={({ field }) => (
            <Textarea
              className="bg-gray-700"
              placeholder="Enter sectors separated by commas"
              {...field}
            />
          )}
        />
        <FormError error={errors.interestedSectors} />
      </div>
    </div>
  );
};

// Main SignUp Component
const SignUp: React.FC<SignUpProps> = ({ setCurrentView, userType, setUserType }) => {
  const [investorStep, setInvestorStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [investorFlowStep, setInvestorFlowStep] = useState<'details' | 'verifyOtp' | 'success'>('details');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [emailValidation, setEmailValidation] = useState<EmailValidation>({ status: 'idle', message: '' });

  const investorForm = useForm<SignUpFormData>({
    resolver: zodResolver(allInvestorStepSchemas[investorStep - 1]),
    mode: 'onChange',
  });

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (!email) return;

    const emailSchema = z.string().email("Invalid email address");
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      setEmailValidation({ status: 'invalid', message: 'Please enter a valid email address.' });
      return;
    }

    setEmailValidation({ status: 'checking', message: 'Checking email...' });
    try {
      const data = await apiClient.checkEmail(email);
      if (data.exists) {
        setEmailValidation({ status: 'invalid', message: 'This email is already registered.' });
      } else {
        setEmailValidation({ status: 'valid', message: 'This email is available.' });
      }
    } catch (error) {
      setEmailValidation({ status: 'invalid', message: 'Could not verify email. Please try again.' });
    }
  };

  const nextInvestorStep = async () => {
    if (await investorForm.trigger()) {
      setInvestorStep(p => p + 1);
    }
  };

  const prevInvestorStep = () => setInvestorStep(p => p - 1);

  const handleInvestorSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError('');
    try {
      await apiClient.registerUser({ ...data, userType: 'investor' } as any);
      setEmailForVerification(data.email);
      setInvestorFlowStep('verifyOtp');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    setLoading(true);
    setError('');
    try {
      await apiClient.verifyUserOtp(emailForVerification, data.otp);
      setInvestorFlowStep('success');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await apiClient.resendUserOtp(emailForVerification);
  };

  if (investorFlowStep === 'verifyOtp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <OtpStep
            title="Verify Your Email"
            description="An OTP has been sent to"
            email={emailForVerification}
            isLoading={loading}
            onOtpSubmit={handleOtpSubmit}
            onResendOtp={handleResendOtp}
          />
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  if (investorFlowStep === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Registration Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">Your email has been verified successfully.</p>
          <div className="flex justify-center">
            <Button onClick={() => setCurrentView('login')}>
              Proceed to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={sharedStyles.pageContainer}>
      <div className="w-full max-w-4xl mx-auto">
        <Tabs 
          defaultValue={userType === 'investor' ? 'investor' : 'founder'} 
          className="w-full space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
            <TabsTrigger
              value="investor"
              className="relative px-6 py-3 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all"
              onClick={() => setUserType('investor')}
            >
              <div className="flex items-center justify-center space-x-2">
                <User className="w-4 h-4" />
                <span>Investor</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="founder"
              className="relative px-6 py-3 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all"
              onClick={() => setUserType('founder')}
            >
              <div className="flex items-center justify-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Founder</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="investor" className="mt-6">
            <Card className={sharedStyles.cardWrapper}>
              <CardHeader className="text-center space-y-2">
                <CardTitle className={sharedStyles.gradientHeading}>Sign Up as an Investor</CardTitle>
                <CardDescription className={sharedStyles.description}>
                  Join our community of investors and discover promising opportunities
                </CardDescription>
                {investorStep === 1 || investorStep === 2 ? (
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <span>Step {investorStep} of 2</span>
                      <span>{investorStep === 1 ? 'Basic Information' : 'Investment Preferences'}</span>
                    </div>
                    <Progress value={investorStep * 50} className="h-2 bg-gray-700">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-violet-600" />
                    </Progress>
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={investorForm.handleSubmit(handleInvestorSubmit)} className="space-y-6">
                  <div className={`space-y-6 ${sharedStyles.fadeIn}`}>
                    {investorStep === 1 && (
                      <InvestorStep1
                        control={investorForm.control}
                        register={investorForm.register}
                        errors={investorForm.formState.errors}
                        onEmailBlur={handleEmailBlur}
                        emailValidation={emailValidation}
                      />
                    )}

                    {investorStep === 2 && (
                      <InvestorStep2
                        control={investorForm.control}
                        errors={investorForm.formState.errors}
                        setValue={investorForm.setValue}
                      />
                    )}
                  </div>

                  {error && (
                    <div className={sharedStyles.errorAlert}>
                      <p className="text-center">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                    {investorStep > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevInvestorStep}
                        className={sharedStyles.secondaryButton}
                      >
                        Previous
                      </Button>
                    )}
                    <div className="flex-1" />
                    {investorStep === 1 && (
                      <Button 
                        type="button" 
                        onClick={nextInvestorStep}
                        className={sharedStyles.primaryButton}
                      >
                        Continue
                      </Button>
                    )}
                    {investorStep === 2 && (
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className={sharedStyles.primaryButton}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating Account...
                          </span>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="text-center pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                      Already have an account?{' '}
                      <Button 
                        variant="link" 
                        onClick={() => setCurrentView('login')}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal"
                      >
                        Login here
                      </Button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="founder" className="mt-6">
            <Card className={sharedStyles.cardWrapper}>
              <CardHeader className="text-center space-y-2">
                <CardTitle className={sharedStyles.gradientHeading}>Sign Up as a Founder</CardTitle>
                <CardDescription className={sharedStyles.description}>
                  Start your journey to connect with potential investors
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <CompanyOnboarding />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SignUp;

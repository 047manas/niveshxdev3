import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { useSignup } from '@/context/SignupContext';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Building2, User } from 'lucide-react';
import CompanyOnboarding from '@/components/onboarding/CompanyOnboarding';

// --- Zod Schemas ---
const investorStep1Schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneCountryCode: z.string(),
    phoneNumber: z.string().min(1, "Phone number is required"),
    linkedinId: z.string().url("Please enter a valid LinkedIn URL").or(z.literal('')),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const investorStep2Schema = z.object({
    investorType: z.enum(["UHNI/HNI", "Family Office", "VC", "Private Equity"]),
    investmentType: z.array(z.string()).min(1, "Please select at least one investment type"),
    chequeSize: z.string().min(1, "Please select a cheque size"),
    interestedSectors: z.string().min(1, "Please list interested sectors").transform(val => val.split(',').map(s => s.trim()).filter(s => s.length > 0)).refine(arr => arr.length > 0, { message: "Please list at least one valid sector." }),
});

const otpSchema = z.object({
    otp: z.string().min(6, "Your OTP must be 6 characters."),
});

const allInvestorStepSchemas = [investorStep1Schema, investorStep2Schema];

// --- OTP Step Component (reusable) ---
const OtpVerificationStep = ({ onOtpSubmit, isLoading, userEmail, onResendOtp }) => {
    const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
    const [cooldown, setCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => { setCooldown(prev => prev - 1); }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleResend = async () => {
        setCooldown(60);
        setResendStatus('loading');
        try {
            await onResendOtp();
            setResendStatus('success');
        } catch (error) {
            setResendStatus('error');
            setCooldown(0);
        }
    };

    return (
        <form onSubmit={handleSubmit(onOtpSubmit)}>
            <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">Verify Your Email</h3>
                <p className="text-gray-400">An OTP has been sent to <span className="font-semibold text-primary">{userEmail}</span>.</p>
                <div className="flex justify-center">
                    <Controller name="otp" control={control} render={({ field }) => (<InputOTP maxLength={6} {...field}><InputOTPGroup>{[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP>)} />
                </div>
                {errors.otp && <p className="text-red-500 text-xs">{errors.otp.message}</p>}
                <Button type="submit" disabled={isLoading} className="w-full max-w-xs mx-auto">{isLoading ? 'Verifying...' : 'Verify'}</Button>
                <div className="mt-4 text-sm">
                    <p className="text-gray-400">
                        Didn't receive the code?{' '}
                        <Button type="button" variant="link" className="p-0 h-auto" disabled={cooldown > 0} onClick={handleResend}>
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                        </Button>
                    </p>
                    {resendStatus === 'success' && <p className="text-green-500 text-xs">A new OTP has been sent.</p>}
                    {resendStatus === 'error' && <p className="text-red-500 text-xs">Failed to resend OTP. Please try again.</p>}
                </div>
            </div>
        </form>
    );
};


const SignUp = ({ setCurrentView, userType, setUserType }) => {
  const { signupData, updateSignupData } = useSignup();
  const [investorStep, setInvestorStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [investorFlowStep, setInvestorFlowStep] = useState('details');
  const [investorAgreed, setInvestorAgreed] = useState(false);
  const [emailValidation, setEmailValidation] = useState({ status: 'idle', message: '' });

  const handleEmailBlur = async (e) => {
    const email = e.target.value;

    const emailSchema = z.string().email("Invalid email address");
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      setEmailValidation({ status: 'invalid', message: 'Please enter a valid email address.' });
      return;
    }

    setEmailValidation({ status: 'checking', message: 'Checking email...' });
    try {
      const response = await fetch('/api/company/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyEmail: email }),
      });
      const data = await response.json();
      if (data.exists) {
        setEmailValidation({ status: 'invalid', message: 'This email is already registered.' });
      } else {
        setEmailValidation({ status: 'valid', message: 'This email is available.' });
      }
    } catch (error) {
      setEmailValidation({ status: 'invalid', message: 'Could not verify email. Please try again.' });
    }
  };

  const investorForm = useForm({
    resolver: zodResolver(allInvestorStepSchemas[investorStep - 1]),
    mode: 'onChange',
    defaultValues: formData, // Use context formData for defaults
  });

  const nextInvestorStep = async () => { if (await investorForm.trigger()) setInvestorStep(p => p + 1); };
  const prevInvestorStep = () => setInvestorStep(p => p - 1);

  const handleInvestorSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const allData = { ...signupData, ...investorForm.getValues(), ...data };
      updateSignupData(allData); // Update signup context
      
      console.log('Submitting registration with data:', { userType: 'investor', ...allData });
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: 'investor', ...allData }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong');
      
      // Store email in localStorage for OTP verification
      window.localStorage.setItem('emailForVerification', allData.email);
      setInvestorFlowStep('verifyOtp');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestorOtpSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp: data.otp }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to verify OTP.');
        setInvestorFlowStep('success');
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleInvestorResendOtp = async () => {
    setError('');
    try {
        const res = await fetch('/api/auth/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to resend OTP.');
    } catch (err) {
        setError(err.message);
        throw err;
    }
  };

  const renderInvestorForm = () => {
    switch (investorFlowStep) {
        case 'verifyOtp':
            return (
                <OtpVerificationStep
                    onOtpSubmit={handleInvestorOtpSubmit}
                    isLoading={loading}
                    userEmail={formData.email} // Directly use from context
                    onResendOtp={handleInvestorResendOtp}
                />
            );
        case 'success':
            return (
                <div className="space-y-4 text-center">
                    <h3 className="text-lg font-semibold text-green-400">Registration Successful!</h3>
                    <p className="text-gray-400">Your investor account has been created. You can now log in.</p>
                    <Button onClick={() => setCurrentView('login')}>Go to Login</Button>
                </div>
            );
        case 'details':
        default:
            return (
                <div className="space-y-6">
                    <div className="text-center"><p className="text-sm text-gray-400">Step {investorStep} of 2: {["Create Account", "Investment Profile"][investorStep - 1]}</p><Progress value={investorStep * 50} className="mt-2" /></div>
                    <form onSubmit={investorForm.handleSubmit(handleInvestorSubmit)} className="space-y-4">
                        {investorStep === 1 && <InvestorStep1 control={investorForm.control} register={investorForm.register} errors={investorForm.formState.errors} onEmailBlur={handleEmailBlur} emailValidation={emailValidation} />}
                        {investorStep === 2 && <InvestorStep2 control={investorForm.control} errors={investorForm.formState.errors} setValue={investorForm.setValue} />}
                        <div className="flex justify-between pt-4 flex-col space-y-4">
                            {investorStep === 2 && (<div className="flex items-center space-x-2"><Checkbox id="investor-terms" onCheckedChange={setInvestorAgreed} /><Label htmlFor="investor-terms" className="text-sm font-normal text-gray-400">I have read and agree to the <Link href="/terms-and-conditions.html" target="_blank" className="underline hover:text-primary">Terms and Conditions</Link> and <Link href="/privacy-policy.html" target="_blank" className="underline hover:text-primary">Privacy Policy</Link>.</Label></div>)}
                            <div className="flex justify-between">
                                {investorStep > 1 && <Button type="button" onClick={prevInvestorStep} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">Back</Button>}
                                {investorStep < 2 && <Button type="button" onClick={nextInvestorStep} disabled={!investorForm.formState.isValid} className="ml-auto">Next</Button>}
                                {investorStep === 2 && <Button type="submit" disabled={loading || !investorForm.formState.isValid || !investorAgreed} className="ml-auto w-full">{loading ? 'Submitting...' : 'Submit & Verify Email'}</Button>}
                            </div>
                        </div>
                    </form>
                </div>
            );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <Card className="w-full max-w-4xl bg-gray-800 text-white border-gray-700">
            <CardHeader className="text-center"><CardTitle className="text-2xl sm:text-3xl font-bold">Create an Account</CardTitle><p className="text-gray-400">Join our community of founders and investors.</p></CardHeader>
            <CardContent className="p-4 sm:p-6">
                 <Tabs value={userType} onValueChange={(val) => setUserType(val)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-700">
                        <TabsTrigger value="company" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Building2 className="mr-2 h-4 w-4" /> Company</TabsTrigger>
                        <TabsTrigger value="investor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><User className="mr-2 h-4 w-4" /> Investor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="company" className="mt-6"><CompanyOnboarding /></TabsContent>
                    <TabsContent value="investor" className="mt-6">{renderInvestorForm()}</TabsContent>
                </Tabs>
                {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
                <p className="mt-6 text-sm text-center text-gray-400">Already have an account? <button onClick={() => setCurrentView('login')} className="font-medium text-primary hover:underline">Log in</button></p>
            </CardContent>
        </Card>
    </div>
  );
};

// --- INVESTOR STEP COMPONENTS ---
const InvestorStep1 = ({ control, register, errors, onEmailBlur, emailValidation }) => {
  const { formData, handleChange } = useOnboarding();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-2"><Label>First Name</Label><Input {...register("firstName")} value={formData.firstName} onChange={handleChange('firstName')} className="bg-gray-700" />{errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}</div>
        <div className="space-y-2"><Label>Last Name</Label><Input {...register("lastName")} value={formData.lastName} onChange={handleChange('lastName')} className="bg-gray-700" />{errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}</div>
        <div className="space-y-2 md:col-span-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} value={formData.email} onChange={handleChange('email')} onBlur={onEmailBlur} className="bg-gray-700" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            {emailValidation.status === 'checking' && <p className="text-xs text-gray-400">{emailValidation.message}</p>}
            {emailValidation.status === 'valid' && <p className="text-xs text-green-500">{emailValidation.message}</p>}
            {emailValidation.status === 'invalid' && <p className="text-xs text-red-500">{emailValidation.message}</p>}
        </div>
        <div className="space-y-2 md:col-span-2"><Label>Phone Number</Label><div className="grid grid-cols-1 sm:grid-cols-4 gap-2"><Controller name="phoneCountryCode" control={control} render={({ field }) => (<Select onValueChange={(value) => { field.onChange(value); handleChange('countryCode')({ target: { value } }); }} value={field.value}><SelectTrigger className="sm:col-span-1 bg-gray-700"><SelectValue /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="+91">IN (+91)</SelectItem><SelectItem value="+1">US (+1)</SelectItem></SelectContent></Select>)} /><Input type="tel" {...register("phoneNumber")} value={formData.phoneNumber} onChange={handleChange('phoneNumber')} className="sm:col-span-3 bg-gray-700" /></div>{errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>}</div>
        <div className="space-y-2 md:col-span-2"><Label>LinkedIn Id</Label><Input {...register("linkedinId")} value={formData.linkedinProfile} onChange={handleChange('linkedinProfile')} placeholder="https://linkedin.com/in/..." className="bg-gray-700" />{errors.linkedinId && <p className="text-red-500 text-xs">{errors.linkedinId.message}</p>}</div>
        <div className="space-y-2"><Label>Create Password</Label><Input type="password" {...register("password")} value={formData.password} onChange={handleChange('password')} className="bg-gray-700" /></div>
        <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" {...register("confirmPassword")} value={formData.confirmPassword} onChange={handleChange('confirmPassword')} className="bg-gray-700" />{errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}</div>
    </div>
  );
};

const InvestorStep2 = ({ control, errors, setValue }) => {
    const { formData, handleSelectChange, handleInvestmentTypeChange } = useOnboarding();
    const investmentTypes = ["Equity investments", "Debt financing"];
    const chequeSizes = ["₹ 1-5 L", "₹ 5-25 L", "₹ 25-1 Cr", "₹ 1 Cr+", "₹ 10 Cr+", "₹ 100 Cr+"];
    const watchedInvestmentTypes = useWatch({ control, name: 'investmentType' }) || [];
    const handleBothChange = (checked) => { handleInvestmentTypeChange('Both'); };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2 md:col-span-2"><Label>Investor Type</Label><Controller name="investorType" control={control} render={({ field }) => (<Select onValueChange={(value) => { field.onChange(value); handleSelectChange('investorType')(value); }} value={field.value}><SelectTrigger className="bg-gray-700"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="UHNI/HNI">UHNI/HNI</SelectItem><SelectItem value="Family Office">Family Office</SelectItem><SelectItem value="VC">VC</SelectItem><SelectItem value="Private Equity">Private Equity</SelectItem></SelectContent></Select>)} />{errors.investorType && <p className="text-red-500 text-xs">{errors.investorType.message}</p>}</div>
            <div className="space-y-2 md:col-span-2"><Label>Investment Type</Label><Controller name="investmentType" control={control} render={({ field }) => (<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">{investmentTypes.map(type => (<div key={type} className="flex items-center space-x-2"><Checkbox id={type} checked={field.value?.includes(type)} onCheckedChange={checked => { handleInvestmentTypeChange(type); field.onChange(formData.investmentType); }} /><Label htmlFor={type} className="font-normal">{type}</Label></div>))}<div className="flex items-center space-x-2"><Checkbox id="both" checked={watchedInvestmentTypes.length === investmentTypes.length} onCheckedChange={handleBothChange} /><Label htmlFor="both" className="font-normal">Both</Label></div></div>)} />{errors.investmentType && <p className="text-red-500 text-xs">{errors.investmentType.message}</p>}</div>
            <div className="space-y-2 md:col-span-2"><Label>What Cheque Size are you comfortable with?</Label><Controller name="chequeSize" control={control} render={({ field }) => (<RadioGroup onValueChange={(value) => { field.onChange(value); handleSelectChange('chequeSize')(value); }} value={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">{chequeSizes.map(size => (<div key={size} className="flex items-center space-x-2"><RadioGroupItem value={size} id={size} /><Label htmlFor={size} className="font-normal">{size}</Label></div>))}</RadioGroup>)} />{errors.chequeSize && <p className="text-red-500 text-xs">{errors.chequeSize.message}</p>}</div>
            <div className="space-y-2 md:col-span-2"><Label>What sectors / startups are you interested in?</Label><Textarea {...control.register("interestedSectors")} value={formData.interestedSectors} onChange={(e) => handleSelectChange('interestedSectors')(e.target.value)} placeholder="e.g., FinTech, HealthTech, SaaS" className="bg-gray-700" />{errors.interestedSectors && <p className="text-red-500 text-xs">{errors.interestedSectors.message}</p>}</div>
        </div>
    );
};

export default SignUp;

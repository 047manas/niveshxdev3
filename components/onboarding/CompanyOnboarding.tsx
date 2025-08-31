"use client";
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// --- Zod Schemas ---
const userAccountSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  designation: z.string().min(1, "Please select your designation"),
  linkedinProfile: z.string().url("Please enter a valid LinkedIn URL").or(z.literal('')),
  phone: z.object({
    countryCode: z.string().min(1),
    number: z.string().min(1, "Phone number is required"),
  }),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters, include one uppercase letter, one number, and one special character."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const otpSchema = z.object({
    otp: z.string().min(6, "Your OTP must be 6 characters."),
});

const companyProfileSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    companyWebsite: z.string().url("Please enter a valid website URL"),
    companyLinkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal('')),
    oneLiner: z.string().max(150, "Pitch must be 150 characters or less"),
    about: z.string().max(1000, "About section must be 1000 characters or less"),
});

const industries = ["Technology", "Sports", "Retail", "Finance", "Healthcare", "Gaming", "Other"];
const companyDetailsSchema = z.object({
    industry: z.array(z.string()).nonempty("Please select at least one industry."),
    otherIndustry: z.string().optional(),
    primarySector: z.string().min(1, "Primary sector is required"),
    businessModel: z.string().min(1, "Business model is required"),
    stage: z.string().min(1, "Company stage is required"),
    teamSize: z.coerce.number().min(1, "Team size must be at least 1"),
    locations: z.string().min(1, "Please list at least one location."),
}).refine(data => !(data.industry.includes("Other") && !data.otherIndustry), {
    message: "Please specify your industry",
    path: ["otherIndustry"],
});

const fundingHistorySchema = z.object({
    hasRaised: z.enum(["yes", "no"], { required_error: "Please select an option." }),
    totalRaised: z.coerce.number().optional(),
    currency: z.string().optional(),
    rounds: z.coerce.number().optional(),
    latestRound: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.hasRaised === 'yes') {
        if (!data.totalRaised || data.totalRaised <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Total funding raised is required.", path: ["totalRaised"] });
        if (!data.currency) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a currency.", path: ["currency"] });
        if (!data.rounds || data.rounds <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Number of rounds is required.", path: ["rounds"] });
        if (!data.latestRound) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select the latest round.", path: ["latestRound"] });
    }
});

const companyContactSchema = z.object({
    contactEmail: z.string().email("Please enter a valid company email"),
    contactPhone: z.object({
        countryCode: z.string().min(1, "Required"),
        number: z.string().min(1, "Phone number is required"),
    }),
});


// --- Step Components ---

const UserAccountStep = ({ onFormSubmit, isLoading, onEmailBlur, emailValidation }) => {
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(userAccountSchema),
        mode: 'onChange',
        defaultValues: {
            phone: { countryCode: "+91" }
        }
    });
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Step 1: Create Your Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2"><Label>First Name</Label><Input {...register("firstName")} className="bg-gray-700" />{errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}</div>
                <div className="space-y-2"><Label>Last Name</Label><Input {...register("lastName")} className="bg-gray-700" />{errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}</div>
                <div className="space-y-2 md:col-span-2"><Label>Your Designation</Label><Controller name="designation" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger className="bg-gray-700"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="Co-founder">Co-founder</SelectItem><SelectItem value="CEO">CEO</SelectItem><SelectItem value="CTO">CTO</SelectItem><SelectItem value="HR">HR</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>)} />{errors.designation && <p className="text-red-500 text-xs">{errors.designation.message}</p>}</div>
                <div className="space-y-2 md:col-span-2"><Label>Personal LinkedIn Profile</Label><Input {...register("linkedinProfile")} placeholder="https://linkedin.com/in/..." className="bg-gray-700" />{errors.linkedinProfile && <p className="text-red-500 text-xs">{errors.linkedinProfile.message}</p>}</div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Your Work Email</Label>
                    <Input type="email" {...register("email")} onBlur={onEmailBlur} className="bg-gray-700" />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    {emailValidation.status === 'checking' && <p className="text-xs text-gray-400">{emailValidation.message}</p>}
                    {emailValidation.status === 'valid' && <p className="text-xs text-green-500">{emailValidation.message}</p>}
                    {emailValidation.status === 'invalid' && <p className="text-xs text-red-500">{emailValidation.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2"><Label>Phone Number</Label><div className="grid grid-cols-1 sm:grid-cols-4 gap-2"><Controller name="phone.countryCode" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue="+91"><SelectTrigger className="sm:col-span-1 bg-gray-700"><SelectValue /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="+91">IN (+91)</SelectItem><SelectItem value="+1">US (+1)</SelectItem></SelectContent></Select>)} /><Input type="tel" {...register("phone.number")} className="sm:col-span-3 bg-gray-700" /></div>{errors.phone?.number && <p className="text-red-500 text-xs">{errors.phone.number.message}</p>}</div>
                <div className="space-y-2">
                    <Label>Create Password</Label>
                    <Input type="password" {...register("password")} className="bg-gray-700" />
                    <p className="text-xs text-gray-400">Must be 8+ characters and include an uppercase letter, a number, and a special character.</p>
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                </div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" {...register("confirmPassword")} className="bg-gray-700" />{errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}</div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full mt-6">{isLoading ? 'Creating Account...' : 'Create Account & Verify Email'}</Button>
        </form>
    );
};

const OtpVerificationStep = ({ onOtpSubmit, isLoading, userEmail, onResendOtp }) => {
    const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
    const [cooldown, setCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
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
            setCooldown(0); // Allow retry immediately on error
        }
    };

    return (
        <form onSubmit={handleSubmit(onOtpSubmit)}>
            <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">Step 2: Verify Your Email</h3>
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
                    {resendStatus === 'success' && <p className="text-green-500">A new OTP has been sent.</p>}
                    {resendStatus === 'error' && <p className="text-red-500">Failed to resend OTP. Please try again.</p>}
                </div>
            </div>
        </form>
    );
};

const CompanyProfileStep = ({ onFormSubmit, onBack, isLoading }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(companyProfileSchema), mode: 'onChange' });
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
             <h3 className="text-lg font-semibold mb-4 text-center">Step 3: Company Profile</h3>
             <div className="space-y-2"><Label>Company Name</Label><Input {...register("companyName")} className="bg-gray-700" />{errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}</div>
             <div className="space-y-2"><Label>Company Website</Label><Input {...register("companyWebsite")} placeholder="https://example.com" className="bg-gray-700" />{errors.companyWebsite && <p className="text-red-500 text-xs">{errors.companyWebsite.message}</p>}</div>
             <div className="space-y-2"><Label>Company LinkedIn (Optional)</Label><Input {...register("companyLinkedin")} placeholder="https://linkedin.com/company/..." className="bg-gray-700" />{errors.companyLinkedin && <p className="text-red-500 text-xs">{errors.companyLinkedin.message}</p>}</div>
             <div className="space-y-2"><Label>One-Liner Pitch</Label><Input {...register("oneLiner")} className="bg-gray-700" /><p className="text-xs text-gray-400 text-right">{watch('oneLiner', '').length}/150</p>{errors.oneLiner && <p className="text-red-500 text-xs">{errors.oneLiner.message}</p>}</div>
             <div className="space-y-2"><Label>About Your Company</Label><Textarea {...register("about")} className="bg-gray-700" /><p className="text-xs text-gray-400 text-right">{watch('about', '').length}/1000</p>{errors.about && <p className="text-red-500 text-xs">{errors.about.message}</p>}</div>
             <div className="flex justify-between mt-6"><Button type="button" variant="outline" onClick={onBack}>Back</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Checking...' : 'Next'}</Button></div>
        </form>
    );
};

const CompanyVerifyPromptStep = ({ onNext, companyName }) => (
    <div className="space-y-4 text-center">
        <h3 className="text-lg font-semibold">Company Found!</h3>
        <p className="text-gray-400">"{companyName}" is already in our system but has not been verified. To continue, you'll need to verify ownership of the company.</p>
        <Button onClick={onNext}>Proceed to Company Verification</Button>
    </div>
);

const CompanyDetailsStep = ({ onFormSubmit, onBack, isLoading }) => {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm({ resolver: zodResolver(companyDetailsSchema), mode: 'onChange', defaultValues: { industry: [] } });
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Step 4: Company Details</h3>
            <div className="space-y-2"><Label>Industry (Select all that apply)</Label>
                <Controller name="industry" control={control} render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        {industries.map(item => (<div key={item} className="flex items-center space-x-2">
                            <Checkbox id={item} checked={field.value?.includes(item)} onCheckedChange={checked => {
                                return checked ? field.onChange([...field.value, item]) : field.onChange(field.value?.filter(v => v !== item))
                            }} /><Label htmlFor={item} className="font-normal">{item}</Label>
                        </div>))}
                    </div>
                )} />
                {errors.industry && <p className="text-red-500 text-xs">{errors.industry.message}</p>}
                {watch('industry')?.includes("Other") && <div className="space-y-2 pt-2"><Label>Please specify industry</Label><Input {...register("otherIndustry")} className="bg-gray-700" />{errors.otherIndustry && <p className="text-red-500 text-xs">{errors.otherIndustry.message}</p>}</div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                 <div className="space-y-2"><Label>Primary Company Sector</Label><Controller name="primarySector" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger className="bg-gray-700"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="Edtech">Edtech</SelectItem><SelectItem value="Fintech">Fintech</SelectItem><SelectItem value="AI">AI</SelectItem><SelectItem value="SaaS">SaaS</SelectItem><SelectItem value="Deep Tech">Deep Tech</SelectItem></SelectContent></Select>)} />{errors.primarySector && <p className="text-red-500 text-xs">{errors.primarySector.message}</p>}</div>
                 <div className="space-y-2"><Label>Primary Business Model</Label><Controller name="businessModel" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger className="bg-gray-700"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="B2B">B2B</SelectItem><SelectItem value="B2C">B2C</SelectItem><SelectItem value="D2C">D2C</SelectItem><SelectItem value="B2B2C">B2B2C</SelectItem></SelectContent></Select>)} />{errors.businessModel && <p className="text-red-500 text-xs">{errors.businessModel.message}</p>}</div>
                 <div className="space-y-2"><Label>Company Stage</Label><Controller name="stage" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger className="bg-gray-700"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="Pre-seed">Pre-seed</SelectItem><SelectItem value="Seed">Seed</SelectItem><SelectItem value="Series A">Series A</SelectItem><SelectItem value="Series B+">Series B+</SelectItem></SelectContent></Select>)} />{errors.stage && <p className="text-red-500 text-xs">{errors.stage.message}</p>}</div>
                 <div className="space-y-2"><Label>Team Size</Label><Input type="number" {...register("teamSize")} className="bg-gray-700" />{errors.teamSize && <p className="text-red-500 text-xs">{errors.teamSize.message}</p>}</div>
            </div>
            <div className="space-y-2"><Label>Location(s)</Label><Input {...register("locations")} placeholder="e.g. New York, London" className="bg-gray-700" /><p className="text-xs text-gray-400">Separate multiple locations with commas.</p>{errors.locations && <p className="text-red-500 text-xs">{errors.locations.message}</p>}</div>
            <div className="flex justify-between mt-6"><Button type="button" variant="outline" onClick={onBack}>Back</Button><Button type="submit" disabled={isLoading}>Next</Button></div>
        </form>
    );
};

const FundingHistoryStep = ({ onFormSubmit, onBack, isLoading }) => {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm({ resolver: zodResolver(fundingHistorySchema), mode: 'onChange', defaultValues: { hasRaised: "no", currency: "INR" } });
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Step 5: Funding History</h3>
            <div className="space-y-2"><Label>Have you raised external funding?</Label>
                <Controller name="hasRaised" control={control} render={({ field }) => (<RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="yes" /><Label htmlFor="yes" className="font-normal">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="no" /><Label htmlFor="no" className="font-normal">No</Label></div></RadioGroup>)} />
                {errors.hasRaised && <p className="text-red-500 text-xs">{errors.hasRaised.message}</p>}
            </div>
            {watch('hasRaised') === 'yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-gray-700">
                    <div className="space-y-2 md:col-span-2"><Label>Total Funding Raised</Label><div className="flex items-center gap-2">
                        <Controller name="currency" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger className="bg-gray-700 w-[100px]"><SelectValue /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="INR">₹ INR</SelectItem><SelectItem value="USD">$ USD</SelectItem></SelectContent></Select>)} />
                        <Input type="number" {...register("totalRaised")} className="bg-gray-700" /></div>
                        {errors.totalRaised && <p className="text-red-500 text-xs">{errors.totalRaised.message}</p>}{errors.currency && <p className="text-red-500 text-xs">{errors.currency.message}</p>}
                    </div>
                    <div className="space-y-2"><Label>Number of Funding Rounds</Label><Input type="number" {...register("rounds")} className="bg-gray-700" />{errors.rounds && <p className="text-red-500 text-xs">{errors.rounds.message}</p>}</div>
                    <div className="space-y-2"><Label>Latest Funding Round</Label><Controller name="latestRound" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger className="bg-gray-700"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="Pre-seed">Pre-seed</SelectItem><SelectItem value="Seed">Seed</SelectItem><SelectItem value="Series A">Series A</SelectItem><SelectItem value="Series B">Series B</SelectItem><SelectItem value="Series C+">Series C+</SelectItem></SelectContent></Select>)} />{errors.latestRound && <p className="text-red-500 text-xs">{errors.latestRound.message}</p>}</div>
                </div>
            )}
            <div className="flex justify-between mt-6"><Button type="button" variant="outline" onClick={onBack}>Back</Button><Button type="submit" disabled={isLoading}>Next</Button></div>
        </form>
    );
};

const CompanyContactStep = ({ onFormSubmit, onBack, isLoading }) => {
    const { register, handleSubmit, control, formState: { errors } } = useForm({ resolver: zodResolver(companyContactSchema), mode: 'onChange', defaultValues: { contactPhone: { countryCode: "+91" } } });
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Step 6: Company Contact</h3>
            <div className="space-y-2"><Label>Company's Work Email</Label><Input type="email" {...register("contactEmail")} className="bg-gray-700" />{errors.contactEmail && <p className="text-red-500 text-xs">{errors.contactEmail.message}</p>}</div>
            <div className="space-y-2"><Label>Company's Phone Number</Label><div className="flex items-center gap-2">
                <Controller name="contactPhone.countryCode" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger className="bg-gray-700 w-[120px]"><SelectValue /></SelectTrigger><SelectContent className="bg-gray-800 text-white"><SelectItem value="+91">IN (+91)</SelectItem><SelectItem value="+1">US (+1)</SelectItem></SelectContent></Select>)} />
                <Input type="tel" {...register("contactPhone.number")} className="bg-gray-700" /></div>
                {errors.contactPhone?.number && <p className="text-red-500 text-xs">{errors.contactPhone.number.message}</p>}
            </div>
            <div className="flex justify-between mt-6"><Button type="button" variant="outline" onClick={onBack}>Back</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Finish & Submit'}</Button></div>
        </form>
    );
};

const CompanyOtpVerificationStep = ({ onOtpSubmit, isLoading, companyEmail, onResendOtp }) => {
    const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
    const [cooldown, setCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState('');
    useEffect(() => { if (cooldown > 0) { const timer = setInterval(() => { setCooldown(prev => prev - 1); }, 1000); return () => clearInterval(timer); } }, [cooldown]);
    const handleResend = async () => { setCooldown(60); setResendStatus('loading'); try { await onResendOtp(); setResendStatus('success'); } catch (error) { setResendStatus('error'); setCooldown(0); } };
    return (
        <form onSubmit={handleSubmit(onOtpSubmit)}>
            <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">Verify Your Company's Email</h3>
                <p className="text-gray-400">An OTP has been sent to your company's email address: <span className="font-semibold text-primary">{companyEmail}</span>.</p>
                <div className="flex justify-center"><Controller name="otp" control={control} render={({ field }) => (<InputOTP maxLength={6} {...field}><InputOTPGroup>{[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP>)} /></div>
                {errors.otp && <p className="text-red-500 text-xs">{errors.otp.message}</p>}
                <Button type="submit" disabled={isLoading} className="w-full max-w-xs mx-auto">{isLoading ? 'Verifying...' : 'Verify Company'}</Button>
                <div className="mt-4 text-sm">
                    <p className="text-gray-400">Didn't receive the code?{' '}
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

const SuccessStep = ({ message }) => { return <div className="space-y-4 text-center"><h3 className="text-lg font-semibold text-green-400">Onboarding Complete!</h3><p className="text-gray-400">{message}</p></div> };

// --- Main Onboarding Component ---
const CompanyOnboarding = () => {
    const steps = ['userAccount', 'otpVerification', 'companyProfile', 'companyVerifyPrompt', 'companyDetails', 'fundingHistory', 'companyContact', 'companyOtpVerification', 'success'];
    const [currentStep, setCurrentStep] = useState('userAccount');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [onboardingData, setOnboardingData] = useState({});
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
    const [successMessage, setSuccessMessage] = useState('');

    const moveStep = (nextStep) => { if (steps.includes(nextStep)) setCurrentStep(nextStep); };

    const handleUserAccountSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, userType: 'company' })
            });
            const result = await res.json();
            
            if (!res.ok) {
                throw new Error(result.error || 'Registration failed.');
            }

            setOnboardingData({ user: data });

            // Handle different response statuses
            if (result.status === 'SUCCESS' || result.status === 'OTP_RESENT') {
                moveStep('otpVerification');
            } else {
                throw new Error('Unexpected response from server.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleOtpSubmit = async (data) => { 
        setLoading(true); 
        setError(''); 
        try { 
            const res = await fetch('/api/auth/verify-otp', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ email: onboardingData.user.email, otp: data.otp }) 
            }); 
            const result = await res.json();
            
            if (!res.ok) { 
                throw new Error(result.error || 'Failed to verify OTP.'); 
            } 
            
            moveStep('companyProfile'); 
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setLoading(false); 
        } 
    };
    const handleCompanyProfileSubmit = async (data) => { setLoading(true); setError(''); const updatedData = { ...onboardingData, company: data }; setOnboardingData(updatedData); try { const res = await fetch('/api/company/onboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ step: 'checkCompany', email: updatedData.user.email, companyWebsite: data.companyWebsite }) }); const result = await res.json(); if (!res.ok) throw new Error(result.error || 'Failed to check company.'); switch(result.status) { case 'COMPANY_ALREADY_VERIFIED': setSuccessMessage("This company is already verified. Please log in or contact support."); moveStep('success'); break; case 'COMPANY_EXISTS_UNVERIFIED': setOnboardingData(d => ({ ...d, companyId: result.companyId })); moveStep('companyVerifyPrompt'); break; case 'COMPANY_DOES_NOT_EXIST': moveStep('companyDetails'); break; default: throw new Error('Received an unexpected response from the server.'); } } catch (err) { setError(err.message); } finally { setLoading(false); } };
    const handleCompanyDetailsSubmit = async (data) => { let finalIndustry = data.industry.includes("Other") ? [data.otherIndustry] : data.industry; const details = { ...data, industry: finalIndustry }; delete details.otherIndustry; setOnboardingData(prev => ({ ...prev, company: { ...prev.company, ...details } })); moveStep('fundingHistory'); };
    const handleFundingHistorySubmit = async (data) => { setOnboardingData(prev => ({ ...prev, company: { ...prev.company, funding: data } })); moveStep('companyContact'); };
    const handleCompanyContactSubmit = async (data) => { setLoading(true); setError(''); const finalData = { ...onboardingData, company: { ...onboardingData.company, ...data } }; setOnboardingData(finalData); try { const createRes = await fetch('/api/company/onboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ step: 'createCompany', email: finalData.user.email, companyData: finalData.company }) }); const createResult = await createRes.json(); if (!createRes.ok) throw new Error(createResult.error || 'Failed to create company profile.'); const newCompanyId = createResult.companyId; setOnboardingData(d => ({...d, companyId: newCompanyId, company: finalData.company})); const sendOtpRes = await fetch('/api/company/send-verification-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: newCompanyId }) }); if (!sendOtpRes.ok) { const otpError = await sendOtpRes.json(); throw new Error(otpError.error || "Failed to send company verification OTP."); } moveStep('companyOtpVerification'); } catch (err) { setError(err.message); } finally { setLoading(false); } };
    const handleCompanyOtpSubmit = async (data) => { setLoading(true); setError(''); try { const res = await fetch('/api/company/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: onboardingData.companyId, otp: data.otp }) }); if (!res.ok) { const result = await res.json(); throw new Error(result.error || 'Failed to verify company OTP.'); } setSuccessMessage("Your company has been successfully verified!"); moveStep('success'); } catch (err) { setError(err.message); } finally { setLoading(false); } };
    const handleCompanyResendOtp = async () => { setError(''); try { const res = await fetch('/api/company/resend-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: onboardingData.companyId }) }); if (!res.ok) { const result = await res.json(); throw new Error(result.error || 'Failed to resend OTP.'); } } catch (err) { setError(err.message); throw err; } };
    const handleResendOtp = async () => { 
        setError(''); 
        try { 
            const res = await fetch('/api/auth/resend-otp', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ email: onboardingData.user.email }), 
            }); 
            const result = await res.json();
            
            if (!res.ok) { 
                throw new Error(result.error || 'Failed to resend OTP.'); 
            } 
        } catch (err) { 
            setError(err.message); 
            throw err; 
        } 
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'userAccount': return <UserAccountStep onFormSubmit={handleUserAccountSubmit} isLoading={loading} onEmailBlur={handleEmailBlur} emailValidation={emailValidation} />;
            case 'otpVerification': return <OtpVerificationStep onOtpSubmit={handleOtpSubmit} isLoading={loading} userEmail={onboardingData.user?.email} onResendOtp={handleResendOtp} />;
            case 'companyProfile': return <CompanyProfileStep onFormSubmit={handleCompanyProfileSubmit} onBack={() => {}} isLoading={loading} />;
            case 'companyVerifyPrompt': return <CompanyVerifyPromptStep onNext={() => moveStep('companyOtpVerification')} companyName={onboardingData.company?.companyName} />;
            case 'companyDetails': return <CompanyDetailsStep onFormSubmit={handleCompanyDetailsSubmit} onBack={() => moveStep('companyProfile')} isLoading={loading} />;
            case 'fundingHistory': return <FundingHistoryStep onFormSubmit={handleFundingHistorySubmit} onBack={() => moveStep('companyDetails')} isLoading={loading} />;
            case 'companyContact': return <CompanyContactStep onFormSubmit={handleCompanyContactSubmit} onBack={() => moveStep('fundingHistory')} isLoading={loading} />;
            case 'companyOtpVerification': return <CompanyOtpVerificationStep onOtpSubmit={handleCompanyOtpSubmit} isLoading={loading} companyEmail={onboardingData.company?.contactEmail} onResendOtp={handleCompanyResendOtp} />;
            case 'success': return <SuccessStep message={successMessage} />;
            default: return <UserAccountStep onFormSubmit={handleUserAccountSubmit} isLoading={loading} />;
        }
    };

    return (
        <div className="w-full"><Card className="w-full bg-transparent text-white border-0 shadow-none">
            <CardHeader className="text-center p-0 mb-6"><CardTitle className="text-2xl sm:text-3xl font-bold">Company Onboarding</CardTitle><p className="text-gray-400">Let's get you and your company set up.</p></CardHeader>
            <CardContent className="p-0">{renderCurrentStep()}{error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}</CardContent>
        </Card></div>
    );
};

export default CompanyOnboarding;

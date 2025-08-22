import React, { useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
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
import { Building2, User } from 'lucide-react';

declare function triggerOtpVerification(email: string): void;

// --- SCHEMAS FOR COMPANY FORM ---
const companyStep1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  designation: z.enum(["Co-founder", "CEO", "CTO", "HR", "Other"]),
  linkedinProfile: z.string().url("Please enter a valid LinkedIn URL"),
  workEmail: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
const companyStep2Schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().url("Please enter a valid website URL"),
  companyLinkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal('')),
  oneLiner: z.string().max(150, "Pitch must be 150 characters or less"),
  aboutCompany: z.string().max(1000, "About section must be 1000 characters or less"),
  companyCulture: z.string().optional(),
});
const companyStep3Schema = z.object({
  industry: z.array(z.string()).min(1, "Please select at least one industry"),
  primarySector: z.string().min(1, "Primary sector is required"),
  businessModel: z.string().min(1, "Business model is required"),
  companyStage: z.string().min(1, "Company stage is required"),
  teamSize: z.number().min(1, "Team size must be at least 1"),
  locations: z.string().min(1, "Location is required"),
});
const companyStep4Schema = z.object({
  hasFunding: z.enum(["yes", "no"]),
  totalFundingRaised: z.number().optional(),
  fundingCurrency: z.enum(["INR", "USD"]).optional(),
  fundingRounds: z.number().optional(),
  latestFundingRound: z.string().optional(),
}).refine(data => {
    if (data.hasFunding === 'yes') return data.totalFundingRaised !== undefined && data.fundingRounds !== undefined && data.latestFundingRound !== undefined;
    return true;
}, { message: "Please fill all funding details", path: ["totalFundingRaised"] });
const companyStep5Schema = z.object({
  companyEmail: z.string().email("Invalid email address"),
  companyPhoneCountryCode: z.string(),
  companyPhoneNumber: z.string().min(1, "Phone number is required"),
});
const allCompanyStepSchemas = [companyStep1Schema, companyStep2Schema, companyStep3Schema, companyStep4Schema, companyStep5Schema];


// --- SCHEMAS FOR INVESTOR FORM ---
const investorStep1Schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneCountryCode: z.string(),
    phoneNumber: z.string().min(1, "Phone number is required"),
    linkedinId: z.string().url("Please enter a valid LinkedIn URL"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
const investorStep2Schema = z.object({
    investorType: z.enum(["UHNI/HNI", "Family Office", "VC", "Private Equity"]),
    investmentType: z.array(z.string()).min(1, "Please select at least one investment type"),
    chequeSize: z.string().min(1, "Please select a cheque size"),
    interestedSectors: z.string().min(1, "Please list interested sectors"),
});
const allInvestorStepSchemas = [investorStep1Schema, investorStep2Schema];


const SignUp = ({ setCurrentView, userType, setUserType }) => {
  const [companyStep, setCompanyStep] = useState(1);
  const [investorStep, setInvestorStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- COMPANY FORM HOOK ---
  const companyForm = useForm({
    resolver: zodResolver(allCompanyStepSchemas[companyStep - 1]),
    mode: 'onChange',
    defaultValues: { /* ... company default values ... */ }
  });

  // --- INVESTOR FORM HOOK ---
  const investorForm = useForm({
      resolver: zodResolver(allInvestorStepSchemas[investorStep - 1]),
      mode: 'onChange',
      defaultValues: {
          firstName: '',
          lastName: '',
          email: '',
          phoneCountryCode: '+91',
          phoneNumber: '',
          linkedinId: '',
          password: '',
          confirmPassword: '',
          investorType: undefined,
          investmentType: [],
          chequeSize: undefined,
          interestedSectors: '',
      }
  });

  // --- NAVIGATION LOGIC ---
  const nextCompanyStep = async () => { if (await companyForm.trigger()) setCompanyStep(p => p + 1); };
  const prevCompanyStep = () => setCompanyStep(p => p - 1);
  const nextInvestorStep = async () => { if (await investorForm.trigger()) setInvestorStep(p => p + 1); };
  const prevInvestorStep = () => setInvestorStep(p => p - 1);

  // --- SUBMISSION LOGIC ---
  const onRegister = async (data, type) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: type, ...data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong');
      triggerOtpVerification(data.email || data.workEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onCompanySubmit = (data) => onRegister(data, 'company');
  const onInvestorSubmit = (data) => onRegister(data, 'investor');

  // --- RENDER FUNCTIONS ---
  const renderCompanyForm = () => (
    <div className="space-y-6">
        <div className="text-center">
            <p className="text-sm text-gray-400">Step {companyStep} of 5: {["Create Your Account", "Company Profile", "Company Details", "Funding History", "Company Contact"][companyStep-1]}</p>
            <Progress value={companyStep * 20} className="mt-2" />
        </div>
        <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
            {companyStep === 1 && <CompanyStep1 control={companyForm.control} register={companyForm.register} errors={companyForm.formState.errors} />}
            {companyStep === 2 && <CompanyStep2 control={companyForm.control} register={companyForm.register} errors={companyForm.formState.errors} />}
            {companyStep === 3 && <CompanyStep3 control={companyForm.control} errors={companyForm.formState.errors} />}
            {companyStep === 4 && <CompanyStep4 control={companyForm.control} register={companyForm.register} errors={companyForm.formState.errors} />}
            {companyStep === 5 && <CompanyStep5 control={companyForm.control} register={companyForm.register} errors={companyForm.formState.errors} />}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-between pt-4">
                {companyStep > 1 && <Button type="button" onClick={prevCompanyStep} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">Back</Button>}
                {companyStep < 5 && <Button type="button" onClick={nextCompanyStep} disabled={!companyForm.formState.isValid} className="ml-auto">Next</Button>}
                {companyStep === 5 && <Button type="submit" disabled={loading || !companyForm.formState.isValid} className="ml-auto w-full">{loading ? 'Submitting...' : 'Submit & Verify Email'}</Button>}
            </div>
        </form>
    </div>
  );

  const renderInvestorForm = () => (
    <div className="space-y-6">
        <div className="text-center">
            <p className="text-sm text-gray-400">Step {investorStep} of 2: {["Create Account", "Investment Profile"][investorStep-1]}</p>
            <Progress value={investorStep * 50} className="mt-2" />
        </div>
        <form onSubmit={investorForm.handleSubmit(onInvestorSubmit)} className="space-y-4">
            {investorStep === 1 && <InvestorStep1 control={investorForm.control} register={investorForm.register} errors={investorForm.formState.errors} />}
            {investorStep === 2 && <InvestorStep2 control={investorForm.control} errors={investorForm.formState.errors} />}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-between pt-4">
                {investorStep > 1 && <Button type="button" onClick={prevInvestorStep} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">Back</Button>}
                {investorStep < 2 && <Button type="button" onClick={nextInvestorStep} disabled={!investorForm.formState.isValid} className="ml-auto">Next</Button>}
                {investorStep === 2 && <Button type="submit" disabled={loading || !investorForm.formState.isValid} className="ml-auto w-full">{loading ? 'Submitting...' : 'Submit & Verify Email'}</Button>}
            </div>
        </form>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-full max-w-2xl bg-gray-800 text-white border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <p className="text-gray-400">Join our community of founders and investors.</p>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={(val) => setUserType(val)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-700">
              <TabsTrigger value="company" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Building2 className="mr-2 h-4 w-4" /> Company</TabsTrigger>
              <TabsTrigger value="investor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><User className="mr-2 h-4 w-4" /> Investor</TabsTrigger>
            </TabsList>
            <TabsContent value="company" className="mt-6">{renderCompanyForm()}</TabsContent>
            <TabsContent value="investor" className="mt-6">{renderInvestorForm()}</TabsContent>
          </Tabs>
           <p className="mt-6 text-sm text-center text-gray-400">
            Already have an account?{' '}
            <button onClick={() => setCurrentView('login')} className="font-medium text-primary hover:underline">Log in</button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// --- COMPANY STEP COMPONENTS ---
const CompanyStep1 = ({ control, register, errors }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} className="bg-gray-700 border-gray-600" />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} className="bg-gray-700 border-gray-600" />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="designation">Your Designation in the Organisation</Label>
            <Controller
                name="designation"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-gray-700 border-gray-600"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                            <SelectItem value="Co-founder">Co-founder</SelectItem>
                            <SelectItem value="CEO">CEO</SelectItem>
                            <SelectItem value="CTO">CTO</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.designation && <p className="text-red-500 text-xs">{errors.designation.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="linkedinProfile">Personal LinkedIn Profile</Label>
            <Input id="linkedinProfile" {...register("linkedinProfile")} placeholder="https://linkedin.com/in/..." className="bg-gray-700 border-gray-600" />
            {errors.linkedinProfile && <p className="text-red-500 text-xs">{errors.linkedinProfile.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="workEmail">Company&apos;s Work Email</Label>
            <Input id="workEmail" type="email" {...register("workEmail")} className="bg-gray-700 border-gray-600" />
            {errors.workEmail && <p className="text-red-500 text-xs">{errors.workEmail.message}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input id="password" type="password" {...register("password")} className="bg-gray-700 border-gray-600" />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="bg-gray-700 border-gray-600" />
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>
        </div>
    </div>
);

const CompanyStep2 = ({ control, register, errors }) => {
    const oneLiner = useWatch({ control, name: 'oneLiner' });
    const aboutCompany = useWatch({ control, name: 'aboutCompany' });
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" {...register("companyName")} className="bg-gray-700 border-gray-600" />
                {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input id="companyWebsite" {...register("companyWebsite")} placeholder="https://example.com" className="bg-gray-700 border-gray-600" />
                {errors.companyWebsite && <p className="text-red-500 text-xs">{errors.companyWebsite.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="companyLinkedin">Company LinkedIn Profile (Optional)</Label>
                <Input id="companyLinkedin" {...register("companyLinkedin")} placeholder="https://linkedin.com/company/..." className="bg-gray-700 border-gray-600" />
                {errors.companyLinkedin && <p className="text-red-500 text-xs">{errors.companyLinkedin.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="oneLiner">One-Liner Pitch</Label>
                <Input id="oneLiner" {...register("oneLiner")} className="bg-gray-700 border-gray-600" />
                <p className="text-xs text-gray-400 text-right">{oneLiner?.length || 0}/150</p>
                {errors.oneLiner && <p className="text-red-500 text-xs">{errors.oneLiner.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="aboutCompany">About Company</Label>
                <Textarea id="aboutCompany" {...register("aboutCompany")} className="bg-gray-700 border-gray-600" />
                <p className="text-xs text-gray-400 text-right">{aboutCompany?.length || 0}/1000</p>
                {errors.aboutCompany && <p className="text-red-500 text-xs">{errors.aboutCompany.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="companyCulture">Company Culture (Optional)</Label>
                <Textarea id="companyCulture" {...register("companyCulture")} className="bg-gray-700 border-gray-600" />
                {errors.companyCulture && <p className="text-red-500 text-xs">{errors.companyCulture.message}</p>}
            </div>
        </div>
    );
};

const CompanyStep3 = ({ control, errors }) => {
    const industries = ["Technology", "Sports", "Retail", "Finance", "Healthcare", "Gaming"];
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Industry</Label>
                <Controller
                    name="industry"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {industries.map(industry => (
                                <div key={industry} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={industry}
                                        checked={field.value?.includes(industry)}
                                        onCheckedChange={(checked) => {
                                            const newValue = checked
                                                ? [...field.value, industry]
                                                : field.value.filter((item) => item !== industry);
                                            field.onChange(newValue);
                                        }}
                                    />
                                    <Label htmlFor={industry} className="font-normal">{industry}</Label>
                                </div>
                            ))}
                        </div>
                    )}
                />
                {errors.industry && <p className="text-red-500 text-xs">{errors.industry.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>Company Sector</Label>
                <Controller
                    name="primarySector"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-gray-700 border-gray-600"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                                <SelectItem value="Edtech">Edtech</SelectItem>
                                <SelectItem value="Fintech">Fintech</SelectItem>
                                <SelectItem value="AI">AI</SelectItem>
                                <SelectItem value="SaaS">SaaS</SelectItem>
                                <SelectItem value="Deep Tech">Deep Tech</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.primarySector && <p className="text-red-500 text-xs">{errors.primarySector.message}</p>}
            </div>
             <div className="space-y-2">
                <Label>Company’s Primary Business Model</Label>
                <Controller
                    name="businessModel"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-gray-700 border-gray-600"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                                <SelectItem value="B2B">B2B</SelectItem>
                                <SelectItem value="B2C">B2C</SelectItem>
                                <SelectItem value="D2C">D2C</SelectItem>
                                <SelectItem value="B2B2C">B2B2C</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.businessModel && <p className="text-red-500 text-xs">{errors.businessModel.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>Company Stage</Label>
                <Controller
                    name="companyStage"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-gray-700 border-gray-600"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                                <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                                <SelectItem value="Seed">Seed</SelectItem>
                                <SelectItem value="Series A">Series A</SelectItem>
                                <SelectItem value="Series B+">Series B+</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.companyStage && <p className="text-red-500 text-xs">{errors.companyStage.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="teamSize">Company Team Size</Label>
                <Controller
                    name="teamSize"
                    control={control}
                    render={({ field }) => (
                        <Input id="teamSize" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} className="bg-gray-700 border-gray-600" />
                    )}
                />
                {errors.teamSize && <p className="text-red-500 text-xs">{errors.teamSize.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="locations">Location(s)</Label>
                <Controller
                    name="locations"
                    control={control}
                    render={({ field }) => (
                        <Input id="locations" {...field} placeholder="e.g. New York, London" className="bg-gray-700 border-gray-600" />
                    )}
                />
                <p className="text-xs text-gray-400">Separate multiple locations with commas.</p>
                {errors.locations && <p className="text-red-500 text-xs">{errors.locations.message}</p>}
            </div>
        </div>
    );
};

const CompanyStep4 = ({ control, register, errors }) => {
    const hasFunding = useWatch({ control, name: 'hasFunding' });

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Have you raised external funding?</Label>
                <Controller
                    name="hasFunding"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="yes" /><Label htmlFor="yes">Yes</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="no" /><Label htmlFor="no">No</Label></div>
                        </RadioGroup>
                    )}
                />
            </div>

            {hasFunding === 'yes' && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <div className="space-y-2">
                        <Label htmlFor="totalFundingRaised">Total Funding Raised</Label>
                        <div className="flex">
                             <Controller
                                name="fundingCurrency"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-1/4 bg-gray-700 border-gray-600"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                                            <SelectItem value="INR">₹ INR</SelectItem>
                                            <SelectItem value="USD">$ USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <Controller
                                name="totalFundingRaised"
                                control={control}
                                render={({ field }) => (
                                    <Input id="totalFundingRaised" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} className="w-3/4 bg-gray-700 border-gray-600" />
                                )}
                            />
                        </div>
                        {errors.totalFundingRaised && <p className="text-red-500 text-xs">{errors.totalFundingRaised.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fundingRounds">Number of Funding Rounds</Label>
                        <Controller
                            name="fundingRounds"
                            control={control}
                            render={({ field }) => (
                                <Input id="fundingRounds" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} className="bg-gray-700 border-gray-600" />
                            )}
                        />
                        {errors.fundingRounds && <p className="text-red-500 text-xs">{errors.fundingRounds.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Latest Funding Round</Label>
                        <Controller
                            name="latestFundingRound"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-gray-700 border-gray-600"><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                                        <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                                        <SelectItem value="Seed">Seed</SelectItem>
                                        <SelectItem value="Series A">Series A</SelectItem>
                                        <SelectItem value="Series B">Series B</SelectItem>
                                        <SelectItem value="Series C+">Series C+</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.latestFundingRound && <p className="text-red-500 text-xs">{errors.latestFundingRound.message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const CompanyStep5 = ({ control, register, errors }) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="companyEmail">Company&apos;s Work Email</Label>
            <Input id="companyEmail" type="email" {...register("companyEmail")} className="bg-gray-700 border-gray-600" />
            {errors.companyEmail && <p className="text-red-500 text-xs">{errors.companyEmail.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="companyPhoneNumber">Company&apos;s Phone Number</Label>
            <div className="flex">
                <Controller
                    name="companyPhoneCountryCode"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-1/4 bg-gray-700 border-gray-600"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                                <SelectItem value="+91">IN (+91)</SelectItem>
                                <SelectItem value="+1">US (+1)</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                <Input id="companyPhoneNumber" type="tel" {...register("companyPhoneNumber")} className="w-3/4 bg-gray-700 border-gray-600" />
            </div>
            {errors.companyPhoneNumber && <p className="text-red-500 text-xs">{errors.companyPhoneNumber.message}</p>}
        </div>
    </div>
);


// --- INVESTOR STEP COMPONENTS ---
const InvestorStep1 = ({ control, register, errors }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>First Name</Label><Input {...register("firstName")} className="bg-gray-700 border-gray-600" />{errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}</div>
            <div><Label>Last Name</Label><Input {...register("lastName")} className="bg-gray-700 border-gray-600" />{errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}</div>
        </div>
        <div><Label>Email</Label><Input type="email" {...register("email")} className="bg-gray-700 border-gray-600" />{errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}</div>
        <div>
            <Label>Phone Number</Label>
            <div className="flex">
                <Controller name="phoneCountryCode" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-1/4 bg-gray-700 border-gray-600"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700"><SelectItem value="+91">IN (+91)</SelectItem><SelectItem value="+1">US (+1)</SelectItem></SelectContent>
                    </Select>
                )} />
                <Input type="tel" {...register("phoneNumber")} className="w-3/4 bg-gray-700 border-gray-600" />
            </div>
            {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>}
        </div>
        <div><Label>LinkedIn Id</Label><Input {...register("linkedinId")} placeholder="https://linkedin.com/in/..." className="bg-gray-700 border-gray-600" />{errors.linkedinId && <p className="text-red-500 text-xs">{errors.linkedinId.message}</p>}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Create Password</Label><Input type="password" {...register("password")} className="bg-gray-700 border-gray-600" />{errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}</div>
            <div><Label>Confirm Password</Label><Input type="password" {...register("confirmPassword")} className="bg-gray-700 border-gray-600" />{errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}</div>
        </div>
    </div>
);

const InvestorStep2 = ({ control, errors }) => {
    const investmentTypes = ["Equity investments", "Debt financing"];
    const chequeSizes = ["₹ 1-5 L", "₹ 5-25 L", "₹ 25-1 Cr", "₹ 1 Cr+", "₹ 10 Cr+", "₹ 100 Cr+"];
    return (
        <div className="space-y-4">
            <div>
                <Label>Investor Type</Label>
                <Controller name="investorType" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-gray-700 border-gray-600"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                            <SelectItem value="UHNI/HNI">UHNI/HNI</SelectItem>
                            <SelectItem value="Family Office">Family Office</SelectItem>
                            <SelectItem value="VC">VC</SelectItem>
                            <SelectItem value="Private Equity">Private Equity</SelectItem>
                        </SelectContent>
                    </Select>
                )} />
                {errors.investorType && <p className="text-red-500 text-xs">{errors.investorType.message}</p>}
            </div>
            <div>
                <Label>Investment Type</Label>
                <Controller name="investmentType" control={control} render={({ field }) => (
                    <div className="flex items-center space-x-4 pt-2">
                        {investmentTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                                <Checkbox id={type} checked={field.value?.includes(type)} onCheckedChange={checked => {
                                    const newValue = checked ? [...field.value, type] : field.value.filter(item => item !== type);
                                    field.onChange(newValue);
                                }} />
                                <Label htmlFor={type} className="font-normal">{type}</Label>
                            </div>
                        ))}
                    </div>
                )} />
                {errors.investmentType && <p className="text-red-500 text-xs">{errors.investmentType.message}</p>}
            </div>
            <div>
                <Label>What Cheque Size are you comfortable with?</Label>
                <Controller name="chequeSize" control={control} render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                        {chequeSizes.map(size => (
                            <div key={size} className="flex items-center space-x-2">
                                <RadioGroupItem value={size} id={size} />
                                <Label htmlFor={size} className="font-normal">{size}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )} />
                {errors.chequeSize && <p className="text-red-500 text-xs">{errors.chequeSize.message}</p>}
            </div>
            <div>
                <Label>What sectors / startups are you interested in?</Label>
                <Textarea {...control.register("interestedSectors")} placeholder="e.g., FinTech, HealthTech, SaaS" className="bg-gray-700 border-gray-600" />
                {errors.interestedSectors && <p className="text-red-500 text-xs">{errors.interestedSectors.message}</p>}
            </div>
        </div>
    );
};

export default SignUp;

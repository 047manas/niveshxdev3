import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, Eye, EyeOff } from 'lucide-react';

const companyFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  designation: z.enum(["Founder", "CXOs", "Other"], {
    required_error: "You need to select a designation.",
  }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  linkedin: z.string().url({ message: "Please enter a valid LinkedIn URL." }),
  companyName: z.string().min(1, { message: "Company name is required." }),
  companyStage: z.enum(["Series A", "Series B", "Series C", "Series D & above", "Pre-IPO", "Other"], {
    required_error: "You need to select a company stage.",
  }),
  latestValuation: z.coerce.number().positive({ message: "Please enter a valid valuation." }),
  shareType: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one share type.",
  }),
  dealSize: z.coerce.number().positive({ message: "Please enter a valid deal size." }),
});

const investorFormSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  investmentFirm: z.string().min(1, { message: "Investment firm is required." }),
  areasOfInterest: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one area of interest.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PhoneInput } from "@/components/ui/phone-input";

const SignUp = ({ setCurrentView }) => {
  const [userType, setUserType] = useState('company');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      linkedin: "",
      companyName: "",
      shareType: [],
    },
  });

  async function onSubmit(values: z.infer<typeof companyFormSchema>) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/company/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      alert("Form submitted successfully!");
      // Optionally, you could reset the form or redirect the user here
      // form.reset();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const renderCompanyForm = () => (
    <Form {...companyForm}>
      <form onSubmit={companyForm.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-[#3BB273]">Founder Information</h3>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={companyForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={companyForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={companyForm.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Designation *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]">
                        <SelectValue placeholder="Select a designation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Founder">Founder</SelectItem>
                      <SelectItem value="CXOs">CXO</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={companyForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={companyForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Phone Number *</FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder="98765 43210"
                      {...field}
                      className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={companyForm.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">LinkedIn Profile *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.linkedin.com/in/yourprofile/" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-[#3BB273]">Company Details</h3>
          <div className="space-y-4 mt-4">
            <FormField
              control={companyForm.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={companyForm.control}
              name="companyStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Company Stage *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]">
                        <SelectValue placeholder="Select a stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Series A">Series A</SelectItem>
                      <SelectItem value="Series B">Series B</SelectItem>
                      <SelectItem value="Series C">Series C</SelectItem>
                      <SelectItem value="Series D & above">Series D & above</SelectItem>
                      <SelectItem value="Pre-IPO">Pre-IPO</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={companyForm.control}
              name="latestValuation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Latest Valuation (in INR CR) *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 500" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={companyForm.control}
              name="shareType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Share Type (Select those that apply) *</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      className="flex-wrap justify-start"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <ToggleGroupItem value="Common Shares">Common Shares</ToggleGroupItem>
                      <ToggleGroupItem value="Preferred Shares">Preferred Shares</ToggleGroupItem>
                      <ToggleGroupItem value="Employee Stock Options">Employee Stock Options</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={companyForm.control}
              name="dealSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Deal Size (in INR CR) *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );

  const investorForm = useForm<z.infer<typeof investorFormSchema>>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      investmentFirm: "",
      areasOfInterest: [],
    },
  });

  async function onInvestorRegister(values: z.infer<typeof investorFormSchema>) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          userType: 'investor',
          investmentFirm: values.investmentFirm,
          areasOfInterest: values.areasOfInterest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      window.localStorage.setItem('emailForVerification', values.email);
      setCurrentView('verify-otp');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const renderInvestorForm = () => (
    <Form {...investorForm}>
      <form onSubmit={investorForm.handleSubmit(onInvestorRegister)} className="space-y-4">
        <FormField
          control={investorForm.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-400">Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="Jane Smith" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={investorForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-400">Email *</FormLabel>
              <FormControl>
                <Input placeholder="investor@domain.com" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={investorForm.control}
          name="investmentFirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-400">Investment Firm *</FormLabel>
              <FormControl>
                <Input placeholder="VC Partners" {...field} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={investorForm.control}
          name="areasOfInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-400">Areas of Interest *</FormLabel>
              <FormControl>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  className="flex-wrap justify-start"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <ToggleGroupItem value="Fintech">Fintech</ToggleGroupItem>
                  <ToggleGroupItem value="SaaS">SaaS</ToggleGroupItem>
                  <ToggleGroupItem value="AI/ML">AI/ML</ToggleGroupItem>
                  <ToggleGroupItem value="Deep Tech">Deep Tech</ToggleGroupItem>
                  <ToggleGroupItem value="Healthtech">Healthtech</ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={investorForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-400">Password *</FormLabel>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...field}
                  className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={investorForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-400">Confirm Password *</FormLabel>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...field}
                  className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
      <Card className="w-full max-w-md bg-[#1a2332] border-gray-700 hover:border-[#3BB273]/50 transition-colors text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          <p className="text-gray-400">Join our community of founders and investors.</p>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={setUserType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#0D1B2A] border-gray-600">
              <TabsTrigger value="company" className="data-[state=active]:bg-[#3BB273] data-[state=active]:text-white">
                <Building2 className="mr-2 h-4 w-4" /> Company
              </TabsTrigger>
              <TabsTrigger value="investor" className="data-[state=active]:bg-[#3BB273] data-[state=active]:text-white">
                <User className="mr-2 h-4 w-4" /> Investor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="company" className="mt-4">
              {renderCompanyForm()}
            </TabsContent>
            <TabsContent value="investor" className="mt-4">
              {renderInvestorForm()}
            </TabsContent>
          </Tabs>
          <p className="mt-6 text-sm text-center text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('login')}
              className="font-medium text-[#3BB273] hover:underline"
            >
              Log in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;

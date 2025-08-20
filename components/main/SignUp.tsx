import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Building2, User } from 'lucide-react';

const SignUp = ({ setCurrentView }) => {
  const [userType, setUserType] = useState('company');
  const [step, setStep] = useState(1); // For two-step company registration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '', // Kept for investor form
    investmentFirm: '', // For investor form

    // Company registration fields
    firstName: '',
    lastName: '',
    designation: '',
    linkedinProfile: '',
    countryCode: '+91',
    phoneNumber: '',
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

  const nextStep = () => {
    // Step 1 Validation
    const { firstName, lastName, designation, linkedinProfile, email, phoneNumber } = formData;
    if (!firstName || !lastName || !designation || !linkedinProfile || !email || !phoneNumber) {
      setError('Please fill in all required fields for Step 1.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const linkedinRegex = /^https:\/\/www\.linkedin\.com\/in\/.+/;
    if (!linkedinRegex.test(linkedinProfile)) {
      setError('LinkedIn Profile must start with https://www.linkedin.com/in/');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (userType === 'company') {
      const { companyName, companyStage, latestValuation, dealSize, shareType } = formData;
      if (!companyName || !companyStage || !latestValuation || !dealSize || shareType.length === 0) {
        setError('Please fill in all required fields for Step 2.');
        setLoading(false);
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const registrationData = {
      userType,
      ...formData,
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Save email for OTP verification page
      window.localStorage.setItem('emailForVerification', formData.email);

      // Switch to OTP verification view
      setCurrentView('verify-otp');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCompanyForm = () => {
    switch (step) {
      case 1:
        return (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-400">First Name *</Label>
                <Input id="firstName" value={formData.firstName} onChange={handleChange('firstName')} required className="bg-[#0D1B2A] border-gray-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-400">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={handleChange('lastName')} required className="bg-[#0D1B2A] border-gray-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-gray-400">Designation *</Label>
                <Select onValueChange={handleSelectChange('designation')} defaultValue={formData.designation}>
                  <SelectTrigger className="bg-[#0D1B2A] border-gray-600 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-gray-600 text-white">
                    <SelectItem value="founder">Founder</SelectItem>
                    <SelectItem value="cxo">CXOs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinProfile" className="text-gray-400">LinkedIn Profile *</Label>
                <Input id="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange('linkedinProfile')} placeholder="https://www.linkedin.com/in/yourprofile/" required className="bg-[#0D1B2A] border-gray-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-400">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange('email')} placeholder="test@gmail.com" required className="bg-[#0D1B2A] border-gray-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-400">Phone number *</Label>
                <div className="flex"><Select defaultValue={formData.countryCode} onValueChange={handleSelectChange('countryCode')}><SelectTrigger className="w-1/4 bg-[#0D1B2A] border-gray-600 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-[#1a2332] border-gray-600 text-white"><SelectItem value="+91">IN (+91)</SelectItem><SelectItem value="+1">US (+1)</SelectItem></SelectContent></Select><Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange('phoneNumber')} className="w-3/4 bg-[#0D1B2A] border-gray-600 text-white" required /></div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white">Next</Button>
            </div>
          </form>
        );
      case 2:
        return (
          <form className="space-y-4" onSubmit={onRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName" className="text-gray-400">Company Name *</Label>
                <Input id="companyName" value={formData.companyName} onChange={handleChange('companyName')} required className="bg-[#0D1B2A] border-gray-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyStage" className="text-gray-400">Company Stage *</Label>
                <Select onValueChange={handleSelectChange('companyStage')} defaultValue={formData.companyStage}>
                  <SelectTrigger className="bg-[#0D1B2A] border-gray-600 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-gray-600 text-white">
                    <SelectItem value="series_a">Series A</SelectItem>
                    <SelectItem value="series_b">Series B</SelectItem>
                    <SelectItem value="series_c">Series C</SelectItem>
                    <SelectItem value="series_d_plus">Series D & above</SelectItem>
                    <SelectItem value="pre_ipo">Pre-IPO</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="latestValuation" className="text-gray-400">Latest Valuation (INR CR) *</Label>
                <Input id="latestValuation" value={formData.latestValuation} onChange={handleChange('latestValuation')} required className="bg-[#0D1B2A] border-gray-600 text-white" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-400">Share Type *</Label>
                <ToggleGroup type="multiple" onValueChange={handleShareTypeChange} defaultValue={formData.shareType} className="flex flex-wrap gap-2">
                  <ToggleGroupItem value="common" className="data-[state=on]:bg-[#3BB273] data-[state=on]:text-white">Common Shares</ToggleGroupItem>
                  <ToggleGroupItem value="preferred" className="data-[state=on]:bg-[#3BB273] data-[state=on]:text-white">Preferred Shares</ToggleGroupItem>
                  <ToggleGroupItem value="esop" className="data-[state=on]:bg-[#3BB273] data-[state=on]:text-white">Employee Stock Options</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dealSize" className="text-gray-400">Deal Size (INR CR) *</Label>
                <Input id="dealSize" value={formData.dealSize} onChange={handleChange('dealSize')} required className="bg-[#0D1B2A] border-gray-600 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-400">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange('password')} required className="bg-[#0D1B2A] border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-400">Confirm Password *</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} required className="bg-[#0D1B2A] border-gray-600 text-white" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-between pt-4">
              <Button type="button" onClick={prevStep} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">Back</Button>
              <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        );
      default:
        return <p>Something went wrong</p>;
    }
  };

  const renderInvestorForm = () => (
    <form className="space-y-4" onSubmit={onRegister}>
      <div className="space-y-2">
        <Label htmlFor="investorFullName" className="text-gray-400">Full Name</Label>
        <Input
          id="investorFullName"
          type="text"
          placeholder="Jane Smith"
          required
          value={formData.fullName}
          onChange={handleChange('fullName')}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="investorEmail" className="text-gray-400">Email</Label>
        <Input
          id="investorEmail"
          type="email"
          placeholder="investor@domain.com"
          required
          value={formData.email}
          onChange={handleChange('email')}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="investorPassword" className="text-gray-400">Password</Label>
        <Input
          id="investorPassword"
          type="password"
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={handleChange('password')}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="investorConfirmPassword" className="text-gray-400">Confirm Password</Label>
        <Input
          id="investorConfirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
      <Card className="w-full max-w-md bg-[#1a2332] border-gray-700 text-white">
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

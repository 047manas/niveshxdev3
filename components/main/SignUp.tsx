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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-input-label">First Name *</Label>
                <Input id="firstName" value={formData.firstName} onChange={handleChange('firstName')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-input-label">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={handleChange('lastName')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-input-label">Designation *</Label>
                <Select onValueChange={handleSelectChange('designation')} defaultValue={formData.designation}>
                  <SelectTrigger className="bg-background border-border text-white"><SelectValue placeholder="Select..." className="placeholder:text-white" /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="founder">Founder</SelectItem>
                    <SelectItem value="cxo">CXOs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinProfile" className="text-input-label">LinkedIn Profile *</Label>
                <Input id="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange('linkedinProfile')} placeholder="https://www.linkedin.com/in/yourprofile/" required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-input-label">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange('email')} placeholder="test@gmail.com" required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-input-label">Phone number *</Label>
                <div className="flex">
                  <Select defaultValue={formData.countryCode} onValueChange={handleSelectChange('countryCode')}>
                    <SelectTrigger className="w-1/4 bg-background border-border text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="+91">IN (+91)</SelectItem>
                      <SelectItem value="+1">US (+1)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange('phoneNumber')} className="w-3/4 bg-background border-border text-foreground placeholder:text-input-label" required />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Next</Button>
            </div>
          </form>
        );
      case 2:
        return (
          <form className="space-y-4" onSubmit={onRegister}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-input-label">Company Name *</Label>
                <Input id="companyName" value={formData.companyName} onChange={handleChange('companyName')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyStage" className="text-input-label">Company Stage *</Label>
                <Select onValueChange={handleSelectChange('companyStage')} defaultValue={formData.companyStage}>
                  <SelectTrigger className="bg-background border-border text-white"><SelectValue placeholder="Select..." className="placeholder:text-white" /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
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
                <Label htmlFor="latestValuation" className="text-input-label">Latest Valuation (INR CR) *</Label>
                <Input id="latestValuation" value={formData.latestValuation} onChange={handleChange('latestValuation')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
              <div className="space-y-2">
                <Label className="text-input-label">Share Type *</Label>
                <ToggleGroup type="multiple" onValueChange={handleShareTypeChange} defaultValue={formData.shareType} className="flex flex-wrap gap-2">
                  <ToggleGroupItem value="common" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Common Shares</ToggleGroupItem>
                  <ToggleGroupItem value="preferred" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Preferred Shares</ToggleGroupItem>
                  <ToggleGroupItem value="esop" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Employee Stock Options</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealSize" className="text-input-label">Deal Size (INR CR) *</Label>
                <Input id="dealSize" value={formData.dealSize} onChange={handleChange('dealSize')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-input-label">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange('password')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-input-label">Confirm Password *</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-between pt-4">
              <Button type="button" onClick={prevStep} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">Back</Button>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
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
        <Label htmlFor="investorFullName" className="text-input-label">Full Name</Label>
        <Input
          id="investorFullName"
          type="text"
          placeholder="Jane Smith"
          required
          value={formData.fullName}
          onChange={handleChange('fullName')}
          className="bg-background border-border text-foreground focus:ring-ring placeholder:text-input-label"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="investorEmail" className="text-input-label">Email</Label>
        <Input
          id="investorEmail"
          type="email"
          placeholder="investor@domain.com"
          required
          value={formData.email}
          onChange={handleChange('email')}
          className="bg-background border-border text-foreground focus:ring-ring placeholder:text-input-label"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="investorPassword" className="text-input-label">Password</Label>
        <Input
          id="investorPassword"
          type="password"
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={handleChange('password')}
          className="bg-background border-border text-foreground focus:ring-ring placeholder:text-input-label"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="investorConfirmPassword" className="text-input-label">Confirm Password</Label>
        <Input
          id="investorConfirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          className="bg-background border-border text-foreground focus:ring-ring placeholder:text-input-label"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md bg-[#1a2332] text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Create an account</CardTitle>
          <p className="text-sub-heading">Join our community of founders and investors.</p>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={setUserType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#0D1B2A] border-gray-600">
              <TabsTrigger value="company" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building2 className="mr-2 h-4 w-4" /> Company
              </TabsTrigger>
              <TabsTrigger value="investor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
          <p className="mt-6 text-sm text-center text-sub-heading">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('login')}
              className="font-medium text-link hover:underline"
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

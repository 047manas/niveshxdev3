import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Textarea } from "@/components/ui/textarea";
import { Building2, User } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const SignUp = ({
  setCurrentView,
  userType,
  setUserType,
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
  handleRadioChange,
}) => {
  const [isStepValid, setIsStepValid] = useState(false);

  const validateStep = (stepToValidate) => {
    const {
      firstName, lastName, designation, linkedinProfile, email, password, confirmPassword,
      companyName, companyWebsite, oneLinerPitch, aboutCompany,
      industry, primaryCompanySector, primaryBusinessModel, companyStage, teamSize,
      hasRaisedFunding, totalFundingRaised, numberOfFundingRounds, latestFundingRound,
      companyWorkEmail, companyPhoneNumber
    } = formData;

    switch (stepToValidate) {
      case 1:
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Min 8 chars, 1 letter, 1 number
        return firstName && lastName && designation && linkedinProfile && email &&
               passwordRegex.test(password) && password === confirmPassword;
      case 2:
        return companyName && companyWebsite && oneLinerPitch && aboutCompany &&
               oneLinerPitch.length <= 150 && aboutCompany.length <= 1000;
      case 3:
        return industry.length > 0 && primaryCompanySector && primaryBusinessModel && companyStage && teamSize;
      case 4:
        if (hasRaisedFunding === 'yes') {
          return totalFundingRaised && numberOfFundingRounds && latestFundingRound;
        }
        return true; // 'No' is a valid state
      case 5:
        return companyWorkEmail && companyPhoneNumber;
      default:
        return false;
    }
  };

  useEffect(() => {
    setIsStepValid(validateStep(step));
  }, [formData, step]);

  const nextStep = () => {
    if (validateStep(step)) {
      setError('');
      setStep(step + 1);
    } else {
      setError('Please fill in all required fields correctly.');
    }
  };

  const prevStep = () => setStep(step - 1);

  // Investor form steps (unchanged for now)
  const nextInvestorStep = () => {
    const { firstName, lastName, email, password, investorType, linkedinProfile, phoneNumber } = formData;
    if (!firstName || !lastName || !email || !password || !investorType || !linkedinProfile || !phoneNumber) {
        setError('Please fill in all required fields.');
        return;
    }
    if (password !== formData.confirmPassword) {
      setError('Passwords do not match.');
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
    setInvestorStep(investorStep + 1);
  };
  const prevInvestorStep = () => setInvestorStep(investorStep - 1);

  const onRegister = async (e) => {
    e.preventDefault();

    // Final validation of all steps before submitting
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        setError(`Please complete all required fields in Step ${i} correctly.`);
        setStep(i); // Take user to the invalid step
        return;
      }
    }

    setLoading(true);
    setError('');

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

      window.localStorage.setItem('emailForVerification', formData.email);
      setCurrentView('verify-otp');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const companyStepTitles = [
    "Create Your Account",
    "Company Profile",
    "Company Details",
    "Funding History",
    "Company Contact"
  ];

  const renderCompanyForm = () => {
    return (
      <div>
        <div className="mb-8">
          <p className="text-sm text-gray-400">Step {step} of 5: {companyStepTitles[step - 1]}</p>
          <Progress value={(step / 5) * 100} className="w-full mt-2" />
        </div>

        {(() => {
          switch (step) {
            case 1:
              return (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" value={formData.firstName} onChange={handleChange('firstName')} required className="bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" value={formData.lastName} onChange={handleChange('lastName')} required className="bg-background border-border" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Your Designation *</Label>
                      <Select onValueChange={handleSelectChange('designation')} value={formData.designation}>
                        <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="co-founder">Co-founder</SelectItem>
                          <SelectItem value="ceo">CEO</SelectItem>
                          <SelectItem value="cto">CTO</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedinProfile">Personal LinkedIn Profile *</Label>
                      <Input id="linkedinProfile" type="url" value={formData.linkedinProfile} onChange={handleChange('linkedinProfile')} placeholder="https://linkedin.com/in/your-profile" required className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Your Work Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleChange('email')} required className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Create Password *</Label>
                      <Input id="password" type="password" value={formData.password} onChange={handleChange('password')} required className="bg-background border-border" />
                      <p className="text-xs text-gray-400">Must be at least 8 characters and include one letter and one number.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} required className="bg-background border-border" />
                       {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={!isStepValid}>Next</Button>
                  </div>
                </form>
              );
            case 2:
              return (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input id="companyName" value={formData.companyName} onChange={handleChange('companyName')} required className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Company Website *</Label>
                      <Input id="companyWebsite" type="url" value={formData.companyWebsite} onChange={handleChange('companyWebsite')} placeholder="https://yourcompany.com" required className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyLinkedIn">Company LinkedIn Profile</Label>
                      <Input id="companyLinkedIn" type="url" value={formData.companyLinkedIn} onChange={handleChange('companyLinkedIn')} placeholder="https://linkedin.com/company/your-company" className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oneLinerPitch">One-Liner Pitch *</Label>
                      <Input id="oneLinerPitch" value={formData.oneLinerPitch} onChange={handleChange('oneLinerPitch')} maxLength="150" required className="bg-background border-border" />
                      <p className="text-sm text-gray-400 text-right">{formData.oneLinerPitch.length} / 150</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aboutCompany">About Your Company *</Label>
                      <Textarea id="aboutCompany" value={formData.aboutCompany} onChange={handleChange('aboutCompany')} maxLength="1000" required className="bg-background border-border" />
                      <p className="text-sm text-gray-400 text-right">{formData.aboutCompany.length} / 1000</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    <Button type="submit" disabled={!isStepValid}>Next</Button>
                  </div>
                </form>
              );
            case 3:
              const handleLocationKeyDown = (e) => {
                if (e.key === 'Enter' && e.target.value) {
                  e.preventDefault();
                  const newLocations = [...formData.locations, e.target.value.trim()];
                  setFormData({ ...formData, locations: newLocations });
                  e.target.value = '';
                }
              };

              const removeLocation = (indexToRemove) => {
                const newLocations = formData.locations.filter((_, index) => index !== indexToRemove);
                setFormData({ ...formData, locations: newLocations });
              };

              const industries = ["Technology", "Sports", "Retail", "Finance", "Healthcare", "Manufacturing", "E-commerce"];

              return (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Industry (Select all that apply) *</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {industries.map(industry => (
                          <div key={industry} className="flex items-center space-x-2">
                            <Checkbox
                              id={`industry-${industry}`}
                              value={industry}
                              checked={formData.industry.includes(industry)}
                              onCheckedChange={(checked) => {
                                const event = { target: { value: industry, checked: checked, type: 'checkbox' } };
                                handleChange('industry')(event);
                              }}
                            />
                            <Label htmlFor={`industry-${industry}`} className="font-normal">{industry}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryCompanySector">Primary Company Sector *</Label>
                        <Select onValueChange={handleSelectChange('primaryCompanySector')} value={formData.primaryCompanySector}>
                          <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="edtech">Edtech</SelectItem>
                            <SelectItem value="fintech">Fintech</SelectItem>
                            <SelectItem value="ai">AI</SelectItem>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="healthtech">Healthtech</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="primaryBusinessModel">Primary Business Model *</Label>
                        <Select onValueChange={handleSelectChange('primaryBusinessModel')} value={formData.primaryBusinessModel}>
                          <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="b2b">B2B</SelectItem>
                            <SelectItem value="b2c">B2C</SelectItem>
                            <SelectItem value="d2c">D2C</SelectItem>
                            <SelectItem value="b2b2c">B2B2C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyStage">Company Stage *</Label>
                          <Select onValueChange={handleSelectChange('companyStage')} value={formData.companyStage}>
                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="pre-seed">Pre-seed</SelectItem>
                              <SelectItem value="seed">Seed</SelectItem>
                              <SelectItem value="series-a">Series A</SelectItem>
                              <SelectItem value="series-b">Series B</SelectItem>
                              <SelectItem value="growth">Growth</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teamSize">Team Size *</Label>
                          <Input id="teamSize" type="number" value={formData.teamSize} onChange={handleChange('teamSize')} required className="bg-background border-border" />
                        </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locations">Location(s) (Press Enter to add)</Label>
                      <div className="flex flex-wrap gap-2 p-2 border border-border rounded-md bg-background">
                        {formData.locations.map((loc, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-700 text-white px-2 py-1 rounded-full text-sm">
                            {loc}
                            <button type="button" onClick={() => removeLocation(index)} className="text-gray-300 hover:text-white">&times;</button>
                          </div>
                        ))}
                        <Input id="locations" onKeyDown={handleLocationKeyDown} placeholder="Type a city and press Enter" className="flex-1 bg-transparent border-none focus:ring-0" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    <Button type="submit" disabled={!isStepValid}>Next</Button>
                  </div>
                </form>
              );
            case 4:
              return (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Have you raised external funding? *</Label>
                      <RadioGroup
                        value={formData.hasRaisedFunding}
                        onValueChange={handleSelectChange('hasRaisedFunding')}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="funding-yes" />
                          <Label htmlFor="funding-yes" className="font-normal">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="funding-no" />
                          <Label htmlFor="funding-no" className="font-normal">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.hasRaisedFunding === 'yes' && (
                      <div className="space-y-4 pt-4 border-t border-gray-700">
                         <div className="space-y-2">
                          <Label htmlFor="totalFundingRaised">Total Funding Raised *</Label>
                          <div className="flex gap-2">
                            <Select onValueChange={handleSelectChange('fundingCurrency')} value={formData.fundingCurrency}>
                              <SelectTrigger className="w-1/4 bg-background border-border"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="INR">₹ INR</SelectItem>
                                <SelectItem value="USD">$ USD</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input id="totalFundingRaised" type="number" value={formData.totalFundingRaised} onChange={handleChange('totalFundingRaised')} required className="flex-1 bg-background border-border" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numberOfFundingRounds">Number of Funding Rounds *</Label>
                          <Input id="numberOfFundingRounds" type="number" value={formData.numberOfFundingRounds} onChange={handleChange('numberOfFundingRounds')} required className="bg-background border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="latestFundingRound">Latest Funding Round *</Label>
                           <Select onValueChange={handleSelectChange('latestFundingRound')} value={formData.latestFundingRound}>
                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="pre-seed">Pre-seed</SelectItem>
                              <SelectItem value="seed">Seed</SelectItem>
                              <SelectItem value="series-a">Series A</SelectItem>
                              <SelectItem value="series-b">Series B</SelectItem>
                              <SelectItem value="series-c">Series C</SelectItem>
                              <SelectItem value="growth">Growth</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    <Button type="submit" disabled={!isStepValid}>Next</Button>
                  </div>
                </form>
              );
            case 5:
               return (
                <form className="space-y-4" onSubmit={onRegister}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyWorkEmail">Company's Work Email *</Label>
                      <Input id="companyWorkEmail" type="email" value={formData.companyWorkEmail} onChange={handleChange('companyWorkEmail')} required className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPhoneNumber">Company's Phone Number *</Label>
                      <div className="flex">
                        <Select onValueChange={handleSelectChange('companyPhoneCountryCode')} value={formData.companyPhoneCountryCode}>
                          <SelectTrigger className="w-1/4 bg-background border-border"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="+91">IN (+91)</SelectItem>
                            <SelectItem value="+1">US (+1)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input id="companyPhoneNumber" type="tel" value={formData.companyPhoneNumber} onChange={handleChange('companyPhoneNumber')} required className="w-3/4 bg-background border-border" />
                      </div>
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500 pt-4">{error}</p>}
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    <Button type="submit" disabled={!isStepValid || loading}>
                      {loading ? 'Submitting...' : 'Complete Profile'}
                    </Button>
                  </div>
                </form>
              );
            default:
              return <p>Something went wrong</p>;
          }
        })()}
      </div>
    );
  };

  const renderInvestorForm = () => {
    switch (investorStep) {
      case 1:
        return (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextInvestorStep(); }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-input-label">First Name *</Label>
                <Input id="firstName" value={formData.firstName} onChange={handleChange('firstName')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-input-label">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={handleChange('lastName')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-input-label">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange('email')} placeholder="test@gmail.com" required className="bg-background border-border text-foreground placeholder:text-input-label" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investorType" className="text-input-label">Investor Type *</Label>
              <Select onValueChange={handleSelectChange('investorType')} defaultValue={formData.investorType}>
                <SelectTrigger className="bg-background border-border text-white"><SelectValue placeholder="Select..." className="placeholder:text-white" /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="uhni_hni">UHNI/HNI</SelectItem>
                  <SelectItem value="family_office">Family Office</SelectItem>
                  <SelectItem value="vc">VC</SelectItem>
                  <SelectItem value="private_equity">Private Equity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinProfile" className="text-input-label">LinkedIn Profile *</Label>
              <Input id="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange('linkedinProfile')} placeholder="https://www.linkedin.com/in/yourprofile/" required className="bg-background border-border text-foreground placeholder:text-input-label" />
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-input-label">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange('password')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-input-label">Confirm Password *</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} required className="bg-background border-border text-foreground placeholder:text-input-label" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Next</Button>
            </div>
          </form>
        );
      case 2:
        return (
          <form className="space-y-4" onSubmit={onRegister}>
            <div className="space-y-2">
              <Label htmlFor="chequeSize" className="text-input-label">What cheque sizes are you comfortable with? *</Label>
              <Select onValueChange={handleSelectChange('chequeSize')} defaultValue={formData.chequeSize}>
                <SelectTrigger className="bg-background border-border text-foreground"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="1-5L">₹ 1-5 L</SelectItem>
                  <SelectItem value="5-25L">₹ 5-25 L</SelectItem>
                  <SelectItem value="25L-1Cr">₹ 25-1 cr</SelectItem>
                  <SelectItem value="1Cr+">₹ 1 cr+</SelectItem>
                  <SelectItem value="10Cr+">₹ 10 cr+</SelectItem>
                  <SelectItem value="100Cr+">₹ 100 cr+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestedSectors" className="text-input-label">What sectors / startups are you interested in? *</Label>
              <Textarea id="interestedSectors" value={formData.interestedSectors} onChange={handleChange('interestedSectors')} placeholder="e.g., FinTech, HealthTech, SaaS" required className="bg-background border-border text-foreground" />
            </div>
            {error && <p className="text-sm text-red-500 pt-4">{error}</p>}
            <div className="flex justify-between pt-4">
              <Button type="button" onClick={prevInvestorStep} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">Back</Button>
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

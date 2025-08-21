"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';

const InvestorOnboardingPage1 = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    investorType: '',
    linkedinProfile: '',
    countryCode: '+91',
    phoneNumber: '',
  });
  const [error, setError] = useState('');

  const handleChange = (input) => (e) => {
    setFormData({ ...formData, [input]: e.target.value });
  };

  const handleSelectChange = (input) => (value) => {
    setFormData({ ...formData, [input]: value });
  };

  const onNext = () => {
    const { investorType, linkedinProfile, phoneNumber } = formData;
    if (!investorType || !linkedinProfile || !phoneNumber) {
      setError('Please fill in all required fields.');
      return;
    }
    const linkedinRegex = /^https:\/\/www\.linkedin\.com\/in\/.+/;
    if (!linkedinRegex.test(linkedinProfile)) {
        setError('LinkedIn Profile must start with https://www.linkedin.com/in/');
        return;
    }
    setError('');
    // Store data in local storage to pass to the next step
    localStorage.setItem('investorOnboardingData', JSON.stringify(formData));
    router.push('/investor-onboarding/step2');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
      <Card className="w-full max-w-md bg-[#1a2332] border-gray-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Complete Your Investor Profile</CardTitle>
          <p className="text-gray-400">Step 1: Investor Details</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="investorType" className="text-gray-400">Investor Type *</Label>
              <Select onValueChange={handleSelectChange('investorType')} defaultValue={formData.investorType}>
                <SelectTrigger className="bg-background border-border text-foreground"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="uhni_hni">UHNI/HNI</SelectItem>
                  <SelectItem value="family_office">Family Office</SelectItem>
                  <SelectItem value="vc">VC</SelectItem>
                  <SelectItem value="private_equity">Private Equity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinProfile" className="text-gray-400">LinkedIn Profile *</Label>
              <Input id="linkedinProfile" value={formData.linkedinProfile} onChange={handleChange('linkedinProfile')} placeholder="https://www.linkedin.com/in/yourprofile/" required className="bg-background border-border text-foreground focus:ring-ring" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-gray-400">Phone number *</Label>
              <div className="flex">
                <Select defaultValue={formData.countryCode} onValueChange={handleSelectChange('countryCode')}>
                  <SelectTrigger className="w-1/4 bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="+91">IN (+91)</SelectItem>
                    <SelectItem value="+1">US (+1)</SelectItem>
                  </SelectContent>
                </Select>
                <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange('phoneNumber')} className="w-3/4 bg-background border-border text-foreground focus:ring-ring" required />
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 pt-4">{error}</p>}
          <div className="flex justify-end pt-4">
            <Button onClick={onNext} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorOnboardingPage1;

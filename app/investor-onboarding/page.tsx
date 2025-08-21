"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const InvestorOnboardingPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    chequeSize: '',
    interestedSectors: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (input) => (e) => {
    setFormData({ ...formData, [input]: e.target.value });
  };

  const handleSelectChange = (input) => (value) => {
    setFormData({ ...formData, [input]: value });
  };

  const onSubmit = async () => {
    const { chequeSize, interestedSectors } = formData;
    if (!chequeSize || !interestedSectors) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);

    const profileData = {
      ...formData,
      userId: user?.userId,
    };

    try {
      const response = await fetch('/api/investor-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      router.push('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md bg-primary text-primary-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Complete Your Investor Profile</CardTitle>
          <p className="text-gray-400">Investment Preferences</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chequeSize" className="text-gray-400">What cheque sizes are you comfortable with? *</Label>
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
              <Label htmlFor="interestedSectors" className="text-gray-400">What sectors / startups are you interested in? *</Label>
              <Textarea id="interestedSectors" value={formData.interestedSectors} onChange={handleChange('interestedSectors')} placeholder="e.g., FinTech, HealthTech, SaaS" required className="bg-background border-border text-foreground" />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 pt-4">{error}</p>}
          <div className="pt-4">
            <Button onClick={onSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorOnboardingPage;

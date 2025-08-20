import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User } from 'lucide-react';

const SignUp = ({ setCurrentView }) => {
  const router = useRouter();
  const [userType, setUserType] = useState('company');
  const [companyName, setCompanyName] = useState('');
  const [investmentFirm, setInvestmentFirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const registrationData = {
      email,
      password,
      userType,
      fullName,
      ...(userType === 'company' && { companyName }),
      ...(userType === 'investor' && { investmentFirm }),
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
      window.localStorage.setItem('emailForVerification', email);

      // On successful registration, redirect to the OTP verification page
      router.push('/verify-email');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCompanyForm = () => (
    <form className="space-y-4" onSubmit={onRegister}>
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-gray-400">Company Name</Label>
        <Input
          id="companyName"
          type="text"
          placeholder="Your Company Inc."
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="investmentFirm" className="text-gray-400">Investment Firm (Optional)</Label>
        <Input
          id="investmentFirm"
          type="text"
          placeholder="VC Partners"
          value={investmentFirm}
          onChange={(e) => setInvestmentFirm(e.target.value)}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyFullName" className="text-gray-400">Full Name</Label>
        <Input
          id="companyFullName"
          type="text"
          placeholder="John Doe"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyEmail" className="text-gray-400">Email</Label>
        <Input
          id="companyEmail"
          type="email"
          placeholder="founder@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyPassword" className="text-gray-400">Password</Label>
        <Input
          id="companyPassword"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyConfirmPassword" className="text-gray-400">Confirm Password</Label>
        <Input
          id="companyConfirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-[#3BB273]"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );

  const renderInvestorForm = () => (
    <form className="space-y-4" onSubmit={onRegister}>
      <div className="space-y-2">
        <Label htmlFor="investorFullName" className="text-gray-400">Full Name</Label>
        <Input
          id="investorFullName"
          type="text"
          placeholder="Jane Smith"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

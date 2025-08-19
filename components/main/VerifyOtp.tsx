import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyOtp = ({ setCurrentView }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Retrieve email from local storage
    const storedEmail = window.localStorage.getItem('emailForVerification');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Could not find an email for verification. Please sign up again.");
    }
  }, []);

  const onVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      // On successful verification, switch to the login view
      window.localStorage.removeItem('emailForVerification');
      setCurrentView('login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
      <Card className="w-full max-w-md bg-[#1a2332] border-gray-700 hover:border-[#3BB273]/50 transition-colors text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Verify your email</CardTitle>
          <CardDescription className="text-gray-400">
            We've sent a 6-digit code to {email}. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onVerify}>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-2 focus:ring-inset focus:ring-[#3BB273]" />
                  <InputOTPSlot index={1} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-2 focus:ring-inset focus:ring-[#3BB273]" />
                  <InputOTPSlot index={2} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-2 focus:ring-inset focus:ring-[#3BB273]" />
                  <InputOTPSlot index={3} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-2 focus:ring-inset focus:ring-[#3BB273]" />
                  <InputOTPSlot index={4} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-2 focus:ring-inset focus:ring-[#3BB273]" />
                  <InputOTPSlot index={5} className="bg-[#0D1B2A] border-gray-600 text-white focus:ring-2 focus:ring-inset focus:ring-[#3BB273]" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-sm text-center text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;

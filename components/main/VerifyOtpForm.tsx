"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const COOLDOWN_SECONDS = 60;

const VerifyOtpForm = ({ email }: { email: string }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [cooldown]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      setMessage('Verification successful! Redirecting to dashboard...');
      login(data.token); // Log the user in with the received token
      router.push('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setMessage('A new OTP has been sent to your email.');
      setCooldown(COOLDOWN_SECONDS);
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
          <CardTitle className="text-3xl font-bold">Verify Your Account</CardTitle>
          <CardDescription className="text-gray-400 pt-2">
            We've sent a verification code to <span className="font-medium text-[#3BB273]">{email}</span>.
            Please enter the code below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleVerification}>
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
            {message && <p className="text-sm text-center text-green-500">{message}</p>}
            <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Account'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || loading}
              className="text-sm text-[#3BB273] hover:underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtpForm;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useSignup } from '@/context/SignupContext';
import { VerifyOtpProps } from '@/types/auth';

const VerifyOtp: React.FC<VerifyOtpProps> = ({ setCurrentView }): React.ReactNode => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const { signupData } = useSignup();

  useEffect(() => {
    if (signupData.email) {
      setEmail(signupData.email);
    } else {
      const storedEmail = window.localStorage.getItem('emailForVerification');
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setError("Could not find an email for verification. Please sign up again.");
      }
    }
  }, [signupData]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

    const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OTP verification failed');
      
      setSuccess('Email verified successfully!');

      window.localStorage.removeItem('emailForVerification');
      setCurrentView('login');
    } catch (err: unknown) {
      console.error('OTP verification error:', err);
      if (err instanceof Error) {
        if (err.message.includes('incorrect') || err.message.includes('expired')) {
          setError('The OTP you entered is incorrect or has expired. Please try again or request a new code.');
        } else if (err.message.includes('session')) {
          setError("Your verification session has expired. Please request a new code.");
        } else {
          setError('An error occurred during verification. Please try again.');
        }
      } else {
        setError('An unexpected error occurred during verification. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resend OTP.');

      setSuccess(`A new OTP has been sent to ${email}.`);
      setResendCooldown(60); // Start 60-second cooldown
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
      <Card className="w-full max-w-md bg-[#1a2332] border-gray-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Verify your email</CardTitle>
          <CardDescription className="text-gray-400">
            We&apos;ve sent a 6-digit code to {email}. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onVerify}>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-[#0D1B2A] border-gray-600 text-white" />
                  <InputOTPSlot index={1} className="bg-[#0D1B2A] border-gray-600 text-white" />
                  <InputOTPSlot index={2} className="bg-[#0D1B2A] border-gray-600 text-white" />
                  <InputOTPSlot index={3} className="bg-[#0D1B2A] border-gray-600 text-white" />
                  <InputOTPSlot index={4} className="bg-[#0D1B2A] border-gray-600 text-white" />
                  <InputOTPSlot index={5} className="bg-[#0D1B2A] border-gray-600 text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                className="text-sm text-link hover:underline"
              >
                {resendLoading
                  ? 'Sending...'
                  : resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : 'Did not receive code? Resend OTP'}
              </Button>
            </div>

            {error && <p className="text-sm text-center text-red-500">{error}</p>}
            {success && <p className="text-sm text-center text-green-500">{success}</p>}

            <div className="flex justify-between items-center gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => setCurrentView('signup')} className="w-full text-white border-gray-600 hover:bg-gray-700">
                    Back
                </Button>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;

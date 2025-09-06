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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-xl rounded-xl">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Verify your email
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            We&apos;ve sent a 6-digit code to <span className="font-medium text-blue-400">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={onVerify}>
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={setOtp}
                className="gap-2 sm:gap-3"
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot 
                      key={i} 
                      index={i} 
                      className="w-10 h-12 sm:w-12 sm:h-14 bg-gray-900/50 border-gray-600 text-white rounded-lg transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                {resendLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Sending...
                  </span>
                ) : resendCooldown > 0 ? (
                  `Resend OTP in ${resendCooldown}s`
                ) : (
                  'Did not receive code? Resend OTP'
                )}
              </Button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-center text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-center text-green-400">{success}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentView('signup')} 
                  className="w-full sm:w-1/2 text-white border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                    Back
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-1/2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white transition-all disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;

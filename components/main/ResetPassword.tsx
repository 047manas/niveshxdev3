"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const ResetPassword = ({ token }: { token: string }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
        <Card className="w-full max-w-md bg-[#1a2332] border-gray-700 text-white p-8">
          <p className="text-center text-red-500">Invalid password reset token.</p>
        </Card>
      </div>
    );
  }

  const onResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessage('Your password has been reset successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/auth');
      }, 3000);

    } catch (err) {
      setError((err as Error).message || 'An error occurred while resetting your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
      <Card className="w-full max-w-md bg-[#1a2332] border-gray-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Reset Your Password</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onResetPassword}>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-400">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-ring"
              />
              <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-400">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-ring"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

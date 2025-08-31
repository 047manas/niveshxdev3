import React, { useState } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

interface LoginProps {
  setCurrentView: (view: string) => void;
}

const Login = ({ setCurrentView }: LoginProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // For server-side errors
  const { login } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onLogin = async (data: any) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error === 'ACCOUNT_NOT_VERIFIED' || responseData.requiresVerification) {
          window.localStorage.setItem('emailForVerification', data.email);
          setCurrentView('verify-otp');
          return;
        }
        throw new Error(responseData.error || 'Login failed');
      }

      await login(responseData.token);
      router.push('/auth-redirect');

    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
      <Card className="w-full max-w-md bg-[#1a2332] border-gray-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Log in to your account</CardTitle>
          <p className="text-sub-heading">Welcome back!</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onLogin)}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-input-label">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className="bg-background border-border text-foreground focus:ring-ring placeholder:text-input-label"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{(errors.email as FieldError)?.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-input-label">Password</Label>
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot-password')}
                  className="text-sm font-medium text-link hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="bg-background border-border text-foreground focus:ring-ring placeholder:text-input-label"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{(errors.password as FieldError)?.message}</p>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-sub-heading">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => setCurrentView('signup')}
              className="font-medium text-link hover:underline"
            >
              Sign up
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

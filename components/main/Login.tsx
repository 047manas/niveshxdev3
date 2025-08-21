import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const Login = ({ setCurrentView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'NOT_VERIFIED') {
          // Save email for OTP verification page and redirect
          window.localStorage.setItem('emailForVerification', email);
          setCurrentView('verify-otp');
          // No need to set error message here, the view will change
          return;
        }
        throw new Error(data.error || 'Login failed');
      }

      // The login logic (storing token, user data) will be handled by AuthContext
      await login(data.token);

      // Redirect to auth-redirect on successful login
      router.push('/auth-redirect');

    } catch (err) {
      setError(err.message);
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
          <form className="space-y-4" onSubmit={onLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-input-label">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-ring placeholder:text-input-label"
              />
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-ring placeholder:text-input-label"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-sub-heading">
            Don't have an account?{' '}
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

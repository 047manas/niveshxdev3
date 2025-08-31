"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const AuthRedirectPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We want to wait until the auth state is fully loaded
    if (loading) {
      return; // Do nothing while loading
    }

    if (user) {
      // Check completion status and redirect accordingly
      checkCompletionAndRedirect();
    } else {
      // If not authenticated after loading, go back to login
      router.push('/auth');
    }
  }, [user, loading, router]);

  const checkCompletionAndRedirect = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/auth/completion-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        router.push('/auth');
        return;
      }

      const data = await response.json();
      const { completionStatus } = data;

      // Route based on completion status
      switch (completionStatus.nextStep) {
        case 'company-onboarding':
          router.push('/onboarding/company');
          break;
        case 'company-verification-pending':
          router.push('/dashboard?status=pending-verification');
          break;
        case 'verify-email':
          router.push('/auth?view=verify-otp');
          break;
        case 'dashboard':
        default:
          router.push('/dashboard');
          break;
      }
    } catch (error) {
      console.error('Error checking completion status:', error);
      router.push('/auth');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-4xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto bg-gray-700" />
          <Skeleton className="h-4 w-96 mx-auto bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-40 bg-gray-700" />
            <Skeleton className="h-40 bg-gray-700" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 bg-gray-700" />
            <Skeleton className="h-24 bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRedirectPage;

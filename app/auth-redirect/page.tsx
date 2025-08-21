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
      // If user is authenticated, go to dashboard
      router.push('/dashboard');
    } else {
      // If not authenticated after loading, go back to login
      router.push('/auth');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-4xl p-8 space-y-6">
        <Skeleton className="h-12 w-1/4 bg-gray-700" />
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

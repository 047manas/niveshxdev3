"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import FounderDashboard from '@/components/main/FounderDashboard';
import InvestorDashboard from '@/components/main/InvestorDashboard';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A]">
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
  }

  if (!isAuthenticated || !user) {
    // This is a fallback while the redirect is happening
    return null;
  }

  return (
    <div>
      {user.userType === 'company' ? <FounderDashboard /> : <InvestorDashboard />}
    </div>
  );
};

export default DashboardPage;

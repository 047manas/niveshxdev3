"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FounderDashboard from '@/components/main/FounderDashboard';
import InvestorDashboard from '@/components/main/InvestorDashboard';

const DashboardPage = () => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to homepage.
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (user && userProfile) {
    if (userProfile.userType === 'Founder') {
      return <FounderDashboard user={user} />;
    }
    if (userProfile.userType === 'Investor') {
      return <InvestorDashboard user={user} />;
    }
  }

  // This state can happen if the user is authenticated but their profile is not found or is malformed.
  if (user && !loading) {
     return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Could not load user profile. Please contact support.</p>
        </div>
     )
  }

  // If not loading and no user, this will be rendered for a brief moment before redirect kicks in.
  return null;
};

export default DashboardPage;

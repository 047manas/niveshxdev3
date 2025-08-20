"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VerifyOtpForm from '@/components/main/VerifyOtpForm';

const VerifyOtpPageContent = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A] text-white">
        <p>Email not found in URL. Please try registering again.</p>
      </div>
    );
  }

  return <VerifyOtpForm email={email} />;
};

const VerifyOtpPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#0D1B2A] text-white">Loading...</div>}>
      <VerifyOtpPageContent />
    </Suspense>
  );
};

export default VerifyOtpPage;

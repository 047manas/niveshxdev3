"use client";

import React, { Suspense } from 'react';
import ResetPasswordComponent from '@/components/main/ResetPassword';
import { useSearchParams } from 'next/navigation';

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return <ResetPasswordComponent token={token || ''} />;
};

const SuspendedResetPasswordPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ResetPasswordPage />
  </Suspense>
);

export default SuspendedResetPasswordPage;

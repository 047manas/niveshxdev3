"use client";

import EmailVerification from '@/components/main/EmailVerification';
import { Suspense } from 'react';

// A wrapper component to ensure EmailVerification is treated as a client component
// and can use hooks. The page itself is also a client component.
const VerifyEmailPage = () => {
  return (
    // Suspense is good practice when using useSearchParams in a page component
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerification />
    </Suspense>
  );
};

export default VerifyEmailPage;

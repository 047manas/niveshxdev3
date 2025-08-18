"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

const EmailVerification = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying your link...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyLinkAndSignIn = async () => {
      if (!auth) {
        setError('Firebase has not been configured correctly.');
        setStatus('');
        return;
      }
      // Get the one-time code from the URL query parameters.
      const oobCode = searchParams.get('oobCode');
      // Get the user's email from local storage.
      const email = window.localStorage.getItem('emailForSignIn');

      // If the code or email is missing, we can't proceed.
      if (!oobCode || !email) {
        setError('Invalid verification link. The email or code is missing. Please try signing in again.');
        setStatus('');
        return;
      }

      // Verify that the link is a sign-in link.
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          // Sign the user in.
          await signInWithEmailLink(auth, email, window.location.href);

          // Clear the email from local storage.
          window.localStorage.removeItem('emailForSignIn');

          setStatus('Success! You are now signed in. Redirecting to your dashboard...');

          // Redirect to the dashboard.
          router.push('/dashboard');

        } catch (err) {
          console.error('Firebase sign-in error:', err);
          setError('Failed to complete sign-in. The link may have expired or already been used. Please try again.');
          setStatus('');
        }
      } else {
        setError('This is not a valid sign-in link.');
        setStatus('');
      }
    };

    verifyLinkAndSignIn();
    // We only want this effect to run once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Signing You In...
        </h2>
        {status && <p className="text-sm text-gray-600">{status}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {error && (
          <div className="pt-4">
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Homepage
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;

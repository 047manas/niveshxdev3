import React from 'react';
import { Button } from '@/components/ui/button';

const EmailVerification = ({ handleVerify }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold text-gray-900">
        Verify your email
      </h2>
      <p className="text-sm text-gray-600">
        We've sent an email to your address. Please click the link in the email to verify your account.
      </p>
      <div className="pt-4">
        <Button onClick={handleVerify} className="w-full">
          Simulate Verification
        </Button>
      </div>
    </div>
  </div>
);

export default EmailVerification;

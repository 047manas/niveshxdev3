"use client";

import React, { useState } from 'react';
import Login from '@/components/main/Login';
import SignUp from '@/components/main/SignUp';

// This page will manage which authentication view is currently active.
const AuthPage = () => {
  // Possible views: 'signup', 'login', 'verify'
  // The 'verify' view is a simple message after a user signs up.
  const [view, setView] = useState('signup');

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login setCurrentView={setView} />;
      case 'signup':
        return <SignUp setCurrentView={setView} />;
      case 'verify':
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Check your email
                    </h2>
                    <p className="text-sm text-gray-600">
                        We have sent a sign-in link to your email address. Please click the link in the email to log in.
                    </p>
                </div>
            </div>
        );
      default:
        return <SignUp setCurrentView={setView} />;
    }
  };

  return (
    <div>
      {renderView()}
    </div>
  );
};

export default AuthPage;

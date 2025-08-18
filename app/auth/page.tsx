"use client";

import React, { useState } from 'react';
import Login from '@/components/main/Login';
import SignUp from '@/components/main/SignUp';
import VerifyOtp from '@/components/main/VerifyOtp';

// This page manages which authentication view is currently active.
const AuthPage = () => {
  // Possible views: 'signup', 'login', 'verify-otp'
  const [view, setView] = useState('signup');

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login setCurrentView={setView} />;
      case 'signup':
        return <SignUp setCurrentView={setView} />;
      case 'verify-otp':
        return <VerifyOtp setCurrentView={setView} />;
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

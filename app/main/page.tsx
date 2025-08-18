"use client";
import React, { useState } from 'react';
import Login from '../../components/main/Login';
import SignUp from '../../components/main/SignUp';
import VerifyEmail from '../../components/main/VerifyEmail';
import FounderDashboard from '../../components/main/FounderDashboard';
import InvestorDashboard from '../../components/main/InvestorDashboard';

const App = () => {
  const [view, setView] = useState('login');

  // Placeholder functions
  const handleSignUp = () => {
    console.log('handleSignUp called');
    setView('verifyEmail');
  };

  const handleLogin = () => {
    console.log('handleLogin called');
    // In a real app, you'd check the user type here
    setView('founderDashboard'); // or 'investorDashboard'
  };

  const handleVerifyEmail = () => {
    console.log('handleVerifyEmail called');
    // In a real app, you'd check the user type here
    setView('founderDashboard'); // or 'investorDashboard'
  };

  const handleLogout = () => {
    console.log('handleLogout called');
    setView('login');
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login handleLogin={() => setView('founderDashboard')} />;
      case 'signup':
        return <SignUp handleSignUp={() => setView('verifyEmail')} />;
      case 'verifyEmail':
        return <VerifyEmail handleVerifyEmail={() => setView('founderDashboard')} />;
      case 'founderDashboard':
        return <FounderDashboard handleLogout={() => setView('login')} />;
      case 'investorDashboard':
        return <InvestorDashboard handleLogout={() => setView('login')} />;
      default:
        return <Login handleLogin={() => setView('founderDashboard')} />;
    }
  };

  return (
    <div className="bg-gray-200">
        <div className="min-h-screen">
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-2xl font-bold text-gray-800">My App</div>
                        <div>
                            {view !== 'login' && view !== 'signup' && view !== 'verifyEmail' && (
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                {renderView()}
            </main>
        </div>
    </div>
  );
};

export default App;

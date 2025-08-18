import React from 'react';

const FounderDashboard = ({ handleLogout }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="w-full max-w-4xl p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-900">Founder Dashboard</h2>
      <p className="text-center text-gray-600">Welcome, Founder!</p>
      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Log Out
      </button>
    </div>
  </div>
);

export default FounderDashboard;

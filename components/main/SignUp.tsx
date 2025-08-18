import React from 'react';

const SignUp = ({ handleSignUp }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-900">Sign Up</h2>
      <p className="text-center text-gray-600">Placeholder for Sign Up</p>
      <button
        onClick={handleSignUp}
        className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Sign Up
      </button>
    </div>
  </div>
);

export default SignUp;

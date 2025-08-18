import React from 'react';

const Login = ({ handleLogin }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-900">Login</h2>
      <p className="text-center text-gray-600">Placeholder for Login</p>
      <button
        onClick={handleLogin}
        className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Log In
      </button>
    </div>
  </div>
);

export default Login;

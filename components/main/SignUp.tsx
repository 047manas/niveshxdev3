import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SignUp = ({ setCurrentView }) => {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  // Password is no longer needed for passwordless flow
  const [userType, setUserType] = React.useState('Founder');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // The 'handleSignUp' prop is no longer needed as we handle the API call directly.
  const onSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save the email to local storage so we can retrieve it on the verification page.
      window.localStorage.setItem('emailForSignIn', email);
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // On success, switch to the verification view as requested
      // A parent component will need to handle this state change.
      // For now, we can show a message.
      alert("Sign-up successful! Please check your email for a verification link to complete the process.");

      // Or, if a parent component manages the view:
      // setCurrentView('verify');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our community of founders and investors.
          </p>
        </div>
        <form className="space-y-6" onSubmit={onSignUp}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label>You are a:</Label>
            <RadioGroup defaultValue="Founder" onValueChange={setUserType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Founder" id="founder" />
                <Label htmlFor="founder">Founder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Investor" id="investor" />
                <Label htmlFor="investor">Investor</Label>
              </div>
            </RadioGroup>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Sign Up'}
            </Button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => setCurrentView('login')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

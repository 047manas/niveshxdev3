'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testEmail = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success: ${data.message}`);
      } else {
        setError(`❌ Error: ${data.error} (${data.details || 'No details'})`);
      }
    } catch (err: any) {
      setError(`❌ Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'GET',
      });

      const data = await response.json();
      setResult(`📧 Email Config: ${JSON.stringify(data, null, 2)}`);
    } catch (err: any) {
      setError(`❌ Error checking config: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>📧 Email System Test</CardTitle>
            <p className="text-gray-600">Test the email sending functionality</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Test Email Address:
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={testEmail}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Sending...' : '📤 Send Test Email'}
              </Button>
              
              <Button 
                onClick={checkConfig}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? 'Checking...' : '🔧 Check Config'}
              </Button>
            </div>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <pre className="text-sm text-green-800 whitespace-pre-wrap">
                  {result}
                </pre>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <pre className="text-sm text-red-800 whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">📖 Instructions:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Local Development:</strong> Uses Ethereal (test emails)</li>
                <li>• <strong>Production:</strong> Uses your Vercel environment variables</li>
                <li>• <strong>Ethereal URLs:</strong> Check console logs for preview links</li>
                <li>• <strong>Gmail Issues:</strong> Ensure 2FA + App Password is configured</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
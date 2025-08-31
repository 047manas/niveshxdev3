/**
 * Simple test script to verify authentication endpoints
 * Run this after starting the development server
 */

const API_BASE = 'http://localhost:3000/api';

// Test configuration
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  userType: 'investor',
  phoneCountryCode: '+1',
  phoneNumber: '1234567890',
  linkedinProfile: 'https://linkedin.com/in/testuser',
  investorType: 'Angel',
  investmentType: ['Equity investments'],
  chequeSize: '₹ 1-5 L',
  interestedSectors: 'FinTech, SaaS'
};

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`🔄 Testing ${method} ${endpoint}`);
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Response:`, data);
    console.log('---');
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error);
    return { error };
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication API Tests\\n');
  
  // Test 1: Register new user
  console.log('📋 Test 1: User Registration');
  const registerResult = await testAPI('/auth/register', 'POST', TEST_USER);
  
  if (registerResult.data?.status === 'SUCCESS') {
    console.log('✅ Registration successful!');
  } else {
    console.log('ℹ️ Registration response:', registerResult.data?.message);
  }
  
  // Test 2: Try to register same user again
  console.log('📋 Test 2: Duplicate Registration');
  await testAPI('/auth/register', 'POST', TEST_USER);
  
  // Test 3: Resend OTP
  console.log('📋 Test 3: Resend OTP');
  await testAPI('/auth/resend-otp', 'POST', { email: TEST_USER.email });
  
  // Test 4: Verify OTP (will fail without real OTP)
  console.log('📋 Test 4: Verify OTP (with dummy OTP)');
  await testAPI('/auth/verify-otp', 'POST', { 
    email: TEST_USER.email, 
    otp: '123456' 
  });
  
  // Test 5: Login attempt
  console.log('📋 Test 5: Login Attempt');
  await testAPI('/auth/login', 'POST', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  console.log('🎉 Tests completed!\\n');
  console.log('📧 Check your email (or Ethereal logs) for OTP verification codes.');
  console.log('🌐 Visit http://localhost:3000/auth to test the full UI flow.');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests().catch(console.error);
} else {
  // Browser environment
  console.log('Run runTests() in browser console to test APIs');
  window.runTests = runTests;
}
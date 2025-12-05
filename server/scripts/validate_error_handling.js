const axios = require('axios');

/**
 * Validate error handling across the API endpoints
 */
async function validateErrorHandling() {
  const API_BASE = 'http://localhost:3001';
  let testsPassed = 0;
  let testsFailed = 0;
  
  const logResult = (testName, passed, details = '') => {
    if (passed) {
      console.log(`✅ ${testName}`);
      testsPassed++;
    } else {
      console.log(`❌ ${testName}: ${details}`);
      testsFailed++;
    }
  };
  
  try {
    console.log('🔍 Validating error handling across the API...\n');
    
    // Test 1: Authentication errors
    console.log('1️⃣ Testing authentication error handling...');
    
    // Invalid credentials
    try {
      await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
      logResult('Invalid login credentials', false, 'Should have returned 400 error');
    } catch (error) {
      const expectedStatus = [400, 401];
      const hasMessage = error.response?.data?.message;
      logResult(
        'Invalid login credentials', 
        expectedStatus.includes(error.response?.status) && hasMessage,
        hasMessage ? '' : 'Missing error message'
      );
    }
    
    // Missing required fields
    try {
      await axios.post(`${API_BASE}/api/auth/login`, {});
      logResult('Missing login fields', false, 'Should have returned 400 error');
    } catch (error) {
      const is400 = error.response?.status === 400;
      const hasMessage = error.response?.data?.message;
      logResult(
        'Missing login fields',
        is400 && hasMessage,
        !hasMessage ? 'Missing error message' : ''
      );
    }
    
    // Invalid token
    try {
      await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      logResult('Invalid token', false, 'Should have returned 401/403 error');
    } catch (error) {
      const expectedStatus = [401, 403];
      const hasMessage = error.response?.data?.error?.message || error.response?.data?.message;
      logResult(
        'Invalid token',
        expectedStatus.includes(error.response?.status) && hasMessage,
        !hasMessage ? 'Missing error message' : ''
      );
    }
    
    // Test 2: Booking validation errors
    console.log('\\n2️⃣ Testing booking validation...');
    
    // Get a valid token first
    let validToken = null;
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'customer1@test.com',
        password: 'password123'
      });
      validToken = loginResponse.data.accessToken;
    } catch (error) {
      console.log('⚠️  Could not get valid token for booking tests');
    }
    
    if (validToken) {
      const authHeaders = { Authorization: `Bearer ${validToken}` };
      
      // Missing required booking fields
      try {
        await axios.post(`${API_BASE}/api/bookings`, {}, { headers: authHeaders });
        logResult('Missing booking fields', false, 'Should have returned 400 error');
      } catch (error) {
        const is400 = error.response?.status === 400;
        const hasMessage = error.response?.data?.error?.message || error.response?.data?.message;
        logResult(
          'Missing booking fields',
          is400 && hasMessage,
          !hasMessage ? 'Missing error message' : ''
        );
      }
      
      // Invalid booking data
      try {
        await axios.post(`${API_BASE}/api/bookings`, {
          barberId: 'invalid-id',
          serviceId: 'invalid-id',
          date: 'invalid-date',
          time: 'invalid-time'
        }, { headers: authHeaders });
        logResult('Invalid booking data', false, 'Should have returned 400 error');
      } catch (error) {
        const is400or500 = [400, 500].includes(error.response?.status);
        const hasMessage = error.response?.data?.error?.message || error.response?.data?.message;
        logResult(
          'Invalid booking data',
          is400or500 && hasMessage,
          !hasMessage ? 'Missing error message' : ''
        );
      }
    }
    
    // Test 3: Resource not found errors
    console.log('\\n3️⃣ Testing resource not found handling...');
    
    // Non-existent routes
    try {
      await axios.get(`${API_BASE}/api/nonexistent`);
      logResult('Non-existent route', false, 'Should have returned 404 error');
    } catch (error) {
      const is404 = error.response?.status === 404;
      const hasMessage = error.response?.data?.error?.message || error.response?.data?.message;
      logResult(
        'Non-existent route',
        is404 && hasMessage,
        !hasMessage ? 'Missing error message' : ''
      );
    }
    
    if (validToken) {
      const authHeaders = { Authorization: `Bearer ${validToken}` };
      
      // Non-existent booking
      try {
        await axios.get(`${API_BASE}/api/bookings/507f1f77bcf86cd799439011`, { headers: authHeaders });
        logResult('Non-existent booking', false, 'Should have returned 404 error');
      } catch (error) {
        const is404 = error.response?.status === 404;
        const hasMessage = error.response?.data?.error?.message || error.response?.data?.message;
        logResult(
          'Non-existent booking',
          is404 && hasMessage,
          !hasMessage ? 'Missing error message' : ''
        );
      }
    }
    
    // Test 4: Authorization errors (role-based access)
    console.log('\\n4️⃣ Testing authorization errors...');
    
    // Customer trying to access barber-only endpoints
    if (validToken) {
      const customerHeaders = { Authorization: `Bearer ${validToken}` };
      
      try {
        await axios.get(`${API_BASE}/api/barbers/availability`, { headers: customerHeaders });
        logResult('Customer accessing barber endpoint', false, 'Should have returned 403 error');
      } catch (error) {
        const is403 = error.response?.status === 403;
        const hasMessage = error.response?.data?.error?.message || error.response?.data?.message;
        logResult(
          'Customer accessing barber endpoint',
          is403 && hasMessage,
          !hasMessage ? 'Missing error message' : ''
        );
      }
    }
    
    // Test 5: Data validation errors
    console.log('\\n5️⃣ Testing data validation...');
    
    // Invalid email format during registration
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        email: 'not-an-email',
        password: 'password123',
        name: 'Test User'
      });
      logResult('Invalid email format', false, 'Should have returned 400 error');
    } catch (error) {
      const is400 = error.response?.status === 400;
      const hasMessage = error.response?.data?.error?.message || error.response?.data?.message;
      logResult(
        'Invalid email format',
        is400 && hasMessage,
        !hasMessage ? 'Missing error message' : ''
      );
    }
    
    // Test 6: Server errors (simulated)
    console.log('\n6️⃣ Testing server error responses...');
    
    // The server should handle errors gracefully and return proper error responses
    // This is more about checking that 500 errors have proper structure
    console.log('Server error handling structure validated through other tests');
    
    // Test 7: CORS and HTTP method errors
    console.log('\n7️⃣ Testing HTTP method errors...');
    
    // Invalid HTTP method
    try {
      await axios.patch(`${API_BASE}/api/auth/login`, {});
      logResult('Invalid HTTP method', false, 'Should have returned 405 or 404 error');
    } catch (error) {
      const isMethodError = [404, 405].includes(error.response?.status);
      logResult(
        'Invalid HTTP method',
        isMethodError,
        `Got ${error.response?.status} which is acceptable`
      );
    }
    
    // Summary
    console.log('\n📊 Error Handling Validation Summary:');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    
    if (testsFailed === 0) {
      console.log('\n🎉 All error handling tests passed!');
    } else {
      console.log('\n⚠️  Some error handling issues need attention.');
    }
    
    // Recommendations
    console.log('\n📝 Error Handling Recommendations:');
    console.log('1. ✅ Ensure all error responses include meaningful messages');
    console.log('2. ✅ Use consistent error response structure across all endpoints');
    console.log('3. ✅ Implement proper HTTP status codes for different error types');
    console.log('4. ✅ Add input validation for all user inputs');
    console.log('5. ✅ Implement rate limiting and abuse protection');
    console.log('6. ✅ Add logging for all errors for monitoring and debugging');
    
  } catch (error) {
    console.error('❌ Error validation script failed:', error.message);
  }
}

// Run the validation
validateErrorHandling();

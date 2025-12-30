// @ts-nocheck
// API Testing Script
// Run this in browser console to test API endpoints

async function testCurrentAPI() {
  const baseUrl = 'YOUR_INSTANCE_URL'; // Replace with actual URL

  console.log('Testing current API endpoint...');

  try {
    const response = await fetch(`${baseUrl}/api/blocklist?format=json`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('Response data structure:', data);
      console.log('Blocklist entries:', data.blocklist?.length || 0);
      console.log('Employers:', data.employers?.length || 0);

      // Test data structure
      if (data.blocklist && data.blocklist.length > 0) {
        console.log('Sample blocklist entry:', data.blocklist[0]);
      }
    } else {
      console.error('API request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error body:', errorText);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Test alternative endpoints
async function testAlternativeEndpoints() {
  const baseUrl = 'YOUR_INSTANCE_URL'; // Replace with actual URL
  const endpoints = [
    '/api/v1/blocklist',
    '/api/v2/blocklist',
    '/api/labor-actions',
    '/api/actions',
    '/blocklist'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: { 'Accept': 'application/json' }
      });
      console.log(`${endpoint}: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`${endpoint} data keys:`, Object.keys(data));
      }
    } catch (error) {
      console.log(`${endpoint}: Error -`, error.message);
    }
  }
}

// Run tests
testCurrentAPI();
// testAlternativeEndpoints(); // Uncomment to test alternative endpoints

// Quick test script to verify the API works
const http = require('http');

const baseURL = 'http://127.0.0.1:5051';

// Test 1: Health check
console.log('Testing health endpoint...');
http.get(`${baseURL}/health`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✓ Health check:', data);
    testCreateString();
  });
}).on('error', (err) => {
  console.error('✗ Health check failed:', err.message);
});

// Test 2: Create a string
function testCreateString() {
  const postData = JSON.stringify({ value: 'racecar' });
  
  const options = {
    hostname: '127.0.0.1',
    port: 5051,
    path: '/strings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('\nTesting POST /strings with "racecar"...');
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response:', JSON.parse(data));
      testGetString();
    });
  });
  
  req.on('error', (err) => {
    console.error('✗ Create string failed:', err.message);
  });
  
  req.write(postData);
  req.end();
}

// Test 3: Get the string
function testGetString() {
  console.log('\nTesting GET /strings/racecar...');
  http.get(`${baseURL}/strings/racecar`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response:', JSON.parse(data));
      testGetAll();
    });
  }).on('error', (err) => {
    console.error('✗ Get string failed:', err.message);
  });
}

// Test 4: Get all strings
function testGetAll() {
  console.log('\nTesting GET /strings (get all)...');
  http.get(`${baseURL}/strings`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      const result = JSON.parse(data);
      console.log(`Found ${result.count} string(s)`);
      console.log('\n✅ All tests complete!');
    });
  }).on('error', (err) => {
    console.error('✗ Get all failed:', err.message);
  });
}

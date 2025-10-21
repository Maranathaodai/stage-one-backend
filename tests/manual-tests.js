const testEndpoints = {
  baseURL: 'http://127.0.0.1:5051',
  
  tests: [
    {
      name: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      expected: { status: 'ok' }
    },
    {
      name: 'Create String - Palindrome',
      method: 'POST',
      endpoint: '/strings',
      body: { value: 'racecar' },
      expectedStatus: 201
    },
    {
      name: 'Create String - Normal',
      method: 'POST',
      endpoint: '/strings',
      body: { value: 'hello world' },
      expectedStatus: 201
    },
    {
      name: 'Create Duplicate - Should Fail',
      method: 'POST',
      endpoint: '/strings',
      body: { value: 'racecar' },
      expectedStatus: 409
    },
    {
      name: 'Get Specific String',
      method: 'GET',
      endpoint: '/strings/racecar',
      expectedStatus: 200
    },
    {
      name: 'Get All Strings',
      method: 'GET',
      endpoint: '/strings',
      expectedStatus: 200
    },
    {
      name: 'Filter by Palindrome',
      method: 'GET',
      endpoint: '/strings?is_palindrome=true',
      expectedStatus: 200
    },
    {
      name: 'Natural Language Query',
      method: 'GET',
      endpoint: '/strings/filter-by-natural-language?query=all single word palindromic strings',
      expectedStatus: 200
    },
    {
      name: 'Delete String',
      method: 'DELETE',
      endpoint: '/strings/racecar',
      expectedStatus: 204
    },
    {
      name: 'Get Deleted String - Should Fail',
      method: 'GET',
      endpoint: '/strings/racecar',
      expectedStatus: 404
    }
  ]
};

module.exports = testEndpoints;
console.log('=== CURL TEST COMMANDS ===\n');
testEndpoints.tests.forEach((test, i) => {
  console.log(`${i + 1}. ${test.name}`);
  if (test.method === 'GET') {
    console.log(`curl "${testEndpoints.baseURL}${test.endpoint}"`);
  } else if (test.method === 'POST') {
    console.log(`curl -X POST ${testEndpoints.baseURL}${test.endpoint} -H "Content-Type: application/json" -d '${JSON.stringify(test.body)}'`);
  } else if (test.method === 'DELETE') {
    console.log(`curl -X DELETE ${testEndpoints.baseURL}${test.endpoint}`);
  }
  console.log('');
});

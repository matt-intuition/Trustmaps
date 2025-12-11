async function test() {
  // Login to get a real token
  const loginResp = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@trustmap.com', password: 'password123' })
  });

  const loginData = await loginResp.json();
  console.log('Login status:', loginResp.status);

  if (!loginData.token) {
    console.log('Login failed:', loginData);
    return;
  }

  console.log('Token (first 50):', loginData.token.substring(0, 50));

  // Now test analyze endpoint
  const analyzeResp = await fetch('http://localhost:3001/api/import/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.token}`
    },
    body: JSON.stringify({ filePath: 'uploads/takeout-1765421163710-916609378.zip' })
  });

  console.log('Analyze status:', analyzeResp.status);
  const analyzeData = await analyzeResp.json();
  console.log('Total lists:', analyzeData.totalLists || 'none');
  if (analyzeData.lists) {
    console.log('First 3 lists:');
    analyzeData.lists.slice(0, 3).forEach((l: any, i: number) => {
      console.log(`  ${i+1}. ${l.name} (${l.placeCount} places)`);
    });
  } else {
    console.log('Error:', analyzeData);
  }
}

test();

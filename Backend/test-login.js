// Quick API test script
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@prithvinet.gov.in',
    password: 'password123'
  })
});

const data = await response.json();
console.log('\n✅ Login Response:\n');
console.log(JSON.stringify(data, null, 2));

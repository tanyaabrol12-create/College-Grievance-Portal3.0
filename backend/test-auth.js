const http = require('http');

function request(path, method, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload ? payload.length : 0,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    console.log('Health check:');
    const health = await request('/api/test', 'GET');
    console.log(health);

    console.log('Register:');
    const reg = await request('/api/auth/register', 'POST', {
      name: 'CLI Tester',
      email: 'cli.tester@example.com',
      password: 'Passw0rd!',
      role: 'student',
      department: 'CSE',
    });
    console.log(reg);

    console.log('Login:');
    const login = await request('/api/auth/login', 'POST', {
      email: 'cli.tester@example.com',
      password: 'Passw0rd!',
    });
    console.log(login);
  } catch (e) {
    console.error('Error during test:', e.message);
    process.exit(1);
  }
})();


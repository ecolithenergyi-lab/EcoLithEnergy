const test = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../src/app');

test('login, customer accounts, and admin endpoints are permanently unavailable', async (t) => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const disabledApiPaths = [
    ['/api/auth/login', 'POST'],
    ['/api/auth/signup', 'POST'],
    ['/api/auth/google/login', 'GET'],
    ['/api/auth/forgot-password', 'POST'],
    ['/api/auth/reset-password', 'POST'],
    ['/api/auth/verify-email', 'POST'],
    ['/api/auth/cart', 'GET'],
    ['/api/auth/apply-dealer', 'POST'],
    ['/api/profile', 'GET'],
    ['/api/orders', 'GET'],
    ['/api/admin/auth/login', 'POST'],
    ['/api/admin/products', 'GET'],
    ['/api/admin/upload', 'POST']
  ];

  for (const [path, method] of disabledApiPaths) {
    const response = await fetch(`${baseUrl}${path}`, { method });
    assert.equal(response.status, 404, `${method} ${path} should not be mounted`);
  }

  for (const path of [
    '/login',
    '/signup',
    '/dashboard',
    '/profile',
    '/forgot-password',
    '/reset-password/old-token',
    '/admin',
    '/admin/login',
    '/admin/index.html',
    '/client/login.html',
    '/client/signup.html',
    '/client/index.html'
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, `${path} should return the public homepage fallback`);
    assert.doesNotMatch(await response.text(), /authPopup|Staff Portal Login|Sign In to Dashboard/);
  }
});

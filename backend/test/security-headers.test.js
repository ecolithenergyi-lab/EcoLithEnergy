const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const env = require('../src/config/env');
const securityHeaders = require('../src/config/securityHeaders');
const { createCorsOptions } = require('../src/app');

const app = express();
app.use(securityHeaders);
app.use(cors(createCorsOptions()));
app.get('/', (req, res) => res.send('ok'));
app.get('/api/unknown', (req, res) => res.status(404).send('not found'));
let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test('Express Helmet policy blocks inline scripts and framing', async () => {
  const response = await fetch(baseUrl);
  const csp = response.headers.get('content-security-policy');
  const scriptPolicy = csp.split(';').map((part) => part.trim()).find((part) => part.startsWith('script-src '));

  assert.equal(response.status, 200);
  assert.equal(scriptPolicy, "script-src 'self'");
  assert.match(csp, /script-src-attr 'none'/);
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('CORS allows configured frontend origins and rejects unrelated origins', async () => {
  const configuredFrontend = await fetch(`${baseUrl}/api/unknown`, {
    headers: { Origin: env.CLIENT_URL }
  });
  assert.equal(configuredFrontend.headers.get('access-control-allow-origin'), env.CLIENT_URL);
  assert.equal(configuredFrontend.headers.get('access-control-allow-credentials'), 'true');

  const allowed = await fetch(`${baseUrl}/api/unknown`, {
    headers: { Origin: 'http://localhost:5000' }
  });
  if (env.isProduction) {
    assert.equal(allowed.headers.get('access-control-allow-origin'), null);
  } else {
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5000');
    assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');
  }

  const denied = await fetch(`${baseUrl}/api/unknown`, {
    headers: { Origin: 'https://untrusted.example' }
  });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});

test('Vercel serves the frontend with matching security headers', () => {
  const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf8'));
  const headers = config.headers.find((rule) => rule.source === '/(.*)').headers;
  const csp = headers.find((header) => header.key === 'Content-Security-Policy').value;
  const scriptPolicy = csp.split(';').map((part) => part.trim()).find((part) => part.startsWith('script-src '));

  assert.equal(config.outputDirectory, 'frontend');
  assert.equal(scriptPolicy, "script-src 'self'");
  assert.equal(headers.find((header) => header.key === 'X-Frame-Options').value, 'DENY');
});

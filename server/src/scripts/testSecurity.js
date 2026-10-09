/**
 * ============================================================
 * EcoLith Energy — Comprehensive Security & API Test Suite
 * ============================================================
 */

const { connectDatabase, closeDatabase } = require('../config/database');
const createApp = require('../app');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const { createSuperAdmin } = require('./createAdmin');
const { seedDatabase } = require('./seed');
const { sanitizeInput, sanitizeString } = require('../utils/sanitize');
const { verifyMagicBytes } = require('../middleware/uploadSecurity');
const fs = require('fs');
const path = require('path');

let serverInstance = null;
let baseUrl = '';

async function runTests() {
  console.log('\n========================================================');
  console.log('   🛡️  EcoLith Energy — Automated Security & API Suite   ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Connect DB and seed
    await connectDatabase();
    await seedDatabase();
    const admin = await createSuperAdmin({
      name: 'Security Tester',
      email: 'test-admin@ecolithenergy.com',
      password: 'StrongAdmin@2026!'
    });

    // 2. Start server on dynamic port
    const app = createApp();
    const port = 5099;
    baseUrl = `http://127.0.0.1:${port}`;
    serverInstance = app.listen(port);

    console.log(`\n--- 1. Authentication & Brute-Force Tests ---`);

    // Test 1: Reject unauthorized admin access
    const unauthRes = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert(unauthRes.status === 401, 'Unauthorized request to /api/admin/dashboard is rejected (401)');

    // Test 2: Invalid login returns generic error
    const badLoginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-admin@ecolithenergy.com', password: 'WrongPassword123!' })
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 401, 'Invalid login rejected (401)');
    assert(badLoginData.message === 'Invalid email or password.', 'Generic error message used to prevent user enumeration');

    // Test 3: Valid login succeeds and returns cookie
    const validLoginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-admin@ecolithenergy.com', password: 'StrongAdmin@2026!' })
    });
    const validLoginData = await validLoginRes.json();
    
    // Extract full cookie jar
    const setCookieHeaders = validLoginRes.headers.getSetCookie
      ? validLoginRes.headers.getSetCookie()
      : [validLoginRes.headers.get('set-cookie')];

    const csrfToken = (validLoginData.data && validLoginData.data.csrfToken)
      || (setCookieHeaders.find(c => c && c.includes('XSRF-TOKEN=')) || '').replace(/^.*XSRF-TOKEN=([^;]+).*$/, '$1');

    const cookies = setCookieHeaders.map(c => c.split(';')[0]).join('; ');

    assert(validLoginRes.status === 200 && validLoginData.success, 'Valid login succeeds (200)');
    assert(cookies.includes('ecolith.sid'), 'Secure session cookie set');

    // Test 4: Authenticated request succeeds with session
    const authDashRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Cookie: cookies }
    });
    const authDashData = await authDashRes.json();
    assert(authDashRes.status === 200 && authDashData.data.totalProducts > 0, 'Authenticated admin access granted to dashboard');

    console.log(`\n--- 2. Public API Tests ---`);

    // Test 5: Public products endpoint
    const pubProdRes = await fetch(`${baseUrl}/api/products`);
    const pubProdData = await pubProdRes.json();
    assert(pubProdRes.status === 200 && Array.isArray(pubProdData.data), 'Public GET /api/products returns products list');

    // Test 6: Public reviews endpoint
    const pubRevRes = await fetch(`${baseUrl}/api/reviews`);
    const pubRevData = await pubRevRes.json();
    assert(pubRevRes.status === 200 && Array.isArray(pubRevData.data), 'Public GET /api/reviews returns reviews list');

    // Test 7: Public settings endpoint
    const pubSetRes = await fetch(`${baseUrl}/api/settings/public`);
    const pubSetData = await pubSetRes.json();
    assert(pubSetRes.status === 200 && pubSetData.data.companyName === 'EcoLith Energy', 'Public GET /api/settings/public returns company branding');

    // Test 8: Public inquiry creation
    const inqRes = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Amit Kumar',
        phone: '9876543210',
        email: 'amit@example.com',
        company: 'EV Fleet India',
        requirement: 'NMC Battery',
        message: 'Interested in bulk trial packs.'
      })
    });
    const inqData = await inqRes.json();
    assert(inqRes.status === 201 && inqData.success, 'Public POST /api/inquiries stores inquiry');
    assert(inqData.data && inqData.data.whatsappUrl.includes('918595581248'), 'Inquiry response generates secure WhatsApp redirect URL with country code');

    console.log(`\n--- 3. CSRF & Input Sanitization Tests ---`);

    // Test 9: Mutating admin request without CSRF is rejected
    const noCsrfRes = await fetch(`${baseUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Hacked Product' })
    });
    assert(noCsrfRes.status === 403, 'Mutating admin request without CSRF token is rejected (403)');

    // Test 10: Mutating admin request WITH CSRF token passes CSRF check
    const withCsrfRes = await fetch(`${baseUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        Cookie: cookies,
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '72V 40AH LFP Battery Pack',
        category: 'LFP',
        technology: 'LFP Lithium Iron Phosphate',
        voltage: '72V',
        capacity: '40AH',
        description: 'High capacity heavy duty pack.',
        image: '/images/48-30%20battry.jpeg'
      })
    });
    const withCsrfData = await withCsrfRes.json();
    assert(withCsrfRes.status === 201 && withCsrfData.success, 'Mutating admin request with valid CSRF token successfully creates product');

    // Test 11: XSS Sanitization utility strips script tags
    const maliciousHtml = '<script>alert("xss")</script><b>Hello</b>';
    const cleanStr = sanitizeString(maliciousHtml);
    assert(!cleanStr.includes('<script>') && !cleanStr.includes('alert('), 'XSS payload neutralized by sanitizeString');

    // Test 12: NoSQL injection operator stripping
    const noSqlPayload = {
      $where: 'this.password.length > 0',
      'user.nested': 'admin',
      validKey: 'safeValue'
    };
    const sanitizedObj = sanitizeInput(noSqlPayload);
    assert(!sanitizedObj['$where'] && !sanitizedObj['user.nested'] && sanitizedObj.validKey === 'safeValue', 'NoSQL $-keys and dot-keys stripped by sanitizeInput');

    console.log(`\n--- 4. File Upload & Magic Numbers Security ---`);

    // Test 13: Verify Magic Bytes detector on real sample
    const testPngPath = path.resolve(__dirname, '../../../client/images/factory-1.png');
    if (fs.existsSync(testPngPath)) {
      const isPngValid = verifyMagicBytes(testPngPath);
      assert(isPngValid === true, 'Magic Bytes signature detector validates legitimate PNG files');
    }

    // Test 14: Fake malicious file (text file renamed to .png)
    const fakeFilePath = path.resolve(__dirname, 'fake_script.png');
    fs.writeFileSync(fakeFilePath, '<?php echo "evil"; ?>');
    const isFakeValid = verifyMagicBytes(fakeFilePath);
    assert(isFakeValid === false, 'Magic Bytes signature detector rejects spoofed image containing PHP/text');
    fs.unlinkSync(fakeFilePath);

    console.log(`\n--- 5. RBAC & Error Handling ---`);

    // Test 15: Invalid ObjectId handling
    const invalidIdRes = await fetch(`${baseUrl}/api/admin/products/not-a-valid-id`, {
      headers: { Cookie: cookies }
    });
    assert(invalidIdRes.status === 400, 'Invalid MongoDB ObjectId returns safe 400 error instead of 500 crash');

    // Test 16: Logout terminates session
    const logoutRes = await fetch(`${baseUrl}/api/admin/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookies,
        'x-csrf-token': csrfToken
      }
    });
    assert(logoutRes.status === 200, 'Logout succeeds and destroys session');

    const postLogoutRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Cookie: cookies }
    });
    assert(postLogoutRes.status === 401, 'Subsequent request with destroyed session is rejected (401)');

    console.log('\n========================================================');
    console.log(`  Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('========================================================\n');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    if (serverInstance) {
      await new Promise(resolve => serverInstance.close(resolve));
    }
    await closeDatabase();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

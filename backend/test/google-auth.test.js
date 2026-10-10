const test = require('node:test');
const assert = require('node:assert/strict');
const { createGoogleVerify } = require('../src/config/passport');

function runVerify(verify, intent, profile) {
  return new Promise((resolve, reject) => {
    verify({ session: { googleAuthIntent: intent } }, '', '', profile, (error, user, info) => {
      if (error) return reject(error);
      resolve({ user, info });
    });
  });
}

function validProfile(overrides = {}) {
  return {
    id: 'google-user-123',
    displayName: 'New Customer',
    emails: [{ value: 'Customer@Example.com', verified: true }],
    photos: [{ value: 'https://images.example.com/profile.png' }],
    _json: { email_verified: true },
    ...overrides
  };
}

test('Google signup creates a customer only for a verified new email', async () => {
  const created = [];
  const UserModel = {
    findOne: async () => null,
    create: async (details) => {
      created.push(details);
      return details;
    }
  };

  const result = await runVerify(createGoogleVerify(UserModel), 'signup', validProfile());

  assert.equal(result.user.email, 'customer@example.com');
  assert.equal(result.user.role, 'CUSTOMER');
  assert.equal(result.user.provider, 'google');
  assert.equal(created.length, 1);
});

test('Google signup refuses to link an existing email account', async () => {
  const existing = { email: 'customer@example.com', provider: 'local', googleId: null };
  let createCalled = false;
  const UserModel = {
    findOne: async () => existing,
    create: async () => {
      createCalled = true;
    }
  };

  const result = await runVerify(createGoogleVerify(UserModel), 'signup', validProfile());

  assert.equal(result.user, false);
  assert.equal(result.info.code, 'account_exists');
  assert.equal(createCalled, false);
});

test('Google login accepts only the already-linked Google identity', async () => {
  const existing = {
    email: 'customer@example.com',
    googleId: 'google-user-123',
    isActive: true,
    isLocked: () => false,
    save: async () => {}
  };
  const result = await runVerify(
    createGoogleVerify({ findOne: async () => existing }),
    'login',
    validProfile()
  );

  assert.equal(result.user, existing);
});

test('Google signup rejects profiles without a verified email', async () => {
  let findCalled = false;
  const result = await runVerify(
    createGoogleVerify({
      findOne: async () => {
        findCalled = true;
        return null;
      }
    }),
    'signup',
    validProfile({ _json: { email_verified: false } })
  );

  assert.equal(result.user, false);
  assert.equal(result.info.code, 'unverified_email');
  assert.equal(findCalled, false);
});

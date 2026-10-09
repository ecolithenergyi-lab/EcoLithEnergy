const crypto = require('crypto');
const env = require('../config/env');

function signToken(content) {
  return crypto
    .createHmac('sha256', env.SESSION_SECRET)
    .update(content)
    .digest('base64url');
}

function createCustomerToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user._id.toString(),
    tokenVersion: user.tokenVersion || 0
  })).toString('base64url');
  const content = `${header}.${payload}`;
  return `${content}.${signToken(content)}`;
}

function verifyCustomerToken(token) {
  if (typeof token !== 'string') return null;

  const [encodedHeader, encodedPayload, signature, ...extra] = token.split('.');
  if (
    extra.length ||
    !/^[A-Za-z\d_-]+$/.test(encodedHeader || '') ||
    !/^[A-Za-z\d_-]+$/.test(encodedPayload || '') ||
    !/^[A-Za-z\d_-]{43}$/.test(signature || '')
  ) {
    return null;
  }

  const content = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = Buffer.from(signToken(content), 'base64url');
  const providedSignature = Buffer.from(signature, 'base64url');
  if (
    providedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;
    if (!/^[a-f\d]{24}$/i.test(payload.sub || '')) return null;
    if (!Number.isInteger(payload.tokenVersion) || payload.tokenVersion < 0) return null;
    return { userId: payload.sub, tokenVersion: payload.tokenVersion };
  } catch {
    return null;
  }
}

module.exports = { createCustomerToken, verifyCustomerToken };
const crypto = require('crypto');

/**
 * Strips script tags and dangerous HTML characters
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (tag) => ({ '<': '&lt;', '>': '&gt;' }[tag] || tag))
    .trim();
}

/**
 * Deeply sanitizes an object against NoSQL operators and XSS
 */
function sanitizeInput(obj) {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeInput(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block NoSQL injection keys like $gt, $ne, $where
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeInput(value);
  }
  return clean;
}

/**
 * One-way hash for IP address to preserve privacy while supporting rate-limiting and audit
 */
function hashIp(ip) {
  if (!ip) return '0.0.0.0';
  return crypto.createHash('sha256')
    .update(ip + (process.env.IP_HASH_SALT || 'ecolith-public-inquiry'))
    .digest('hex')
    .substring(0, 16);
}

module.exports = {
  sanitizeString,
  sanitizeInput,
  hashIp
};

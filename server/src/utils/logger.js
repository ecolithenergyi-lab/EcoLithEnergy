const logger = {
  info: (msg, meta = {}) => {
    console.log(`[INFO]  [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? sanitizeMeta(meta) : '');
  },
  warn: (msg, meta = {}) => {
    console.warn(`[WARN]  [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? sanitizeMeta(meta) : '');
  },
  error: (msg, meta = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? sanitizeMeta(meta) : '');
  },
  security: (msg, meta = {}) => {
    console.warn(`[SECURITY] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? sanitizeMeta(meta) : '');
  },
  audit: (msg, meta = {}) => {
    console.log(`[AUDIT] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? sanitizeMeta(meta) : '');
  }
};

function sanitizeMeta(meta) {
  const sanitized = { ...meta };
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'SESSION_SECRET'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

module.exports = logger;

const crypto = require('crypto');
const { errorResponse } = require('../utils/response');

// Generate and attach CSRF token cookie on requests
function csrfProtection(req, res, next) {
  // If session exists, initialize CSRF secret in session
  if (req.session) {
    if (!req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    // Set readable cookie for frontend scripts to pass back in headers
    res.cookie('XSRF-TOKEN', req.session.csrfToken, {
      httpOnly: false, // Must be readable by client JS to send in header
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
  }

  // Exempt safe HTTP methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt public inquiry form submission (which is protected by rate-limiting & IP hashing)
  if (req.path === '/api/inquiries' || req.originalUrl === '/api/inquiries') {
    return next();
  }

  // Exempt initial login/signup attempts for public customer auth and admin auth
  const publicAuthPaths = [
    '/api/admin/auth/login',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/google',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];

  if (publicAuthPaths.includes(req.path) || publicAuthPaths.includes(req.originalUrl)) {
    return next();
  }

  // Mutating requests to admin/authenticated APIs must verify CSRF
  const clientToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'] || req.body._csrf;
  const sessionToken = req.session ? req.session.csrfToken : null;

  if (!sessionToken || !clientToken || clientToken !== sessionToken) {
    return errorResponse(res, 'CSRF validation failed. Refresh the page and try again.', 403);
  }

  next();
}

module.exports = {
  csrfProtection
};

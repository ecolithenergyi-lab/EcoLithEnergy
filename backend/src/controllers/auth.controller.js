const Admin = require('../models/Admin');
const { successResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../middleware/audit');
const logger = require('../utils/logger');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const admin = await Admin.findOne({ email: cleanEmail });

    // Protect against user enumeration - use generic message
    const genericErrorMsg = 'Invalid email or password.';

    if (!admin) {
      logger.security(`Failed login attempt for non-existent email: ${cleanEmail}`);
      return errorResponse(res, genericErrorMsg, 401);
    }

    // Check if account is locked
    if (admin.isLocked()) {
      const waitMinutes = Math.ceil((admin.lockedUntil - Date.now()) / (60 * 1000));
      logger.security(`Login attempt to locked account: ${cleanEmail}`);
      return errorResponse(res, `Account is locked due to multiple failed attempts. Please try again in ${waitMinutes} minute(s).`, 423);
    }

    if (!admin.isActive) {
      return errorResponse(res, 'This account is deactivated. Please contact an administrator.', 403);
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        admin.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        logger.security(`Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts: ${cleanEmail}`);
      }
      await admin.save();
      return errorResponse(res, genericErrorMsg, 401);
    }

    // Login success: reset lockout and failed attempts
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLoginAt = new Date();
    await admin.save();

    // Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        logger.error(`Session regeneration failed: ${err.message}`);
        return errorResponse(res, 'Login failed due to a session error.', 500);
      }

      const crypto = require('crypto');
      req.session.adminId = admin._id.toString();
      req.session.role = admin.role;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');

      res.cookie('XSRF-TOKEN', req.session.csrfToken, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });
      res.setHeader('X-CSRF-Token', req.session.csrfToken);

      req.session.save((saveErr) => {
        if (saveErr) {
          logger.error(`Session save failed: ${saveErr.message}`);
          return errorResponse(res, 'Session persistence error.', 500);
        }

        // Log successful login
        logAudit({
          admin,
          action: 'LOGIN',
          resource: 'AUTH',
          resourceId: admin._id,
          details: { email: admin.email, role: admin.role },
          req
        });

        return successResponse(res, {
          admin: admin.toJSON(),
          csrfToken: req.session.csrfToken
        }, 200, 'Login successful.');
      });
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    return errorResponse(res, 'An error occurred during login.', 500);
  }
}

async function logout(req, res) {
  try {
    const admin = req.admin;

    if (admin) {
      logAudit({
        admin,
        action: 'LOGOUT',
        resource: 'AUTH',
        resourceId: admin._id,
        req
      });
    }

    req.session.destroy((err) => {
      if (err) {
        logger.error(`Session destroy error: ${err.message}`);
        return errorResponse(res, 'Could not log out.', 500);
      }
      res.clearCookie(process.env.SESSION_NAME || 'ecolith.sid');
      return successResponse(res, null, 200, 'Logged out successfully.');
    });
  } catch (err) {
    return errorResponse(res, 'Error during logout.', 500);
  }
}

async function getMe(req, res) {
  return successResponse(res, {
    admin: req.admin.toJSON()
  });
}

function getCsrfToken(req, res) {
  return successResponse(res, {
    csrfToken: req.session ? req.session.csrfToken : null
  });
}

module.exports = {
  login,
  logout,
  getMe,
  getCsrfToken
};

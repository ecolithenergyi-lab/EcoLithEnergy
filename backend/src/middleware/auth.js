const Admin = require('../models/Admin');
const { errorResponse } = require('../utils/response');

async function requireAuth(req, res, next) {
  try {
    if (!req.session || !req.session.adminId) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const admin = await Admin.findById(req.session.adminId);
    if (!admin) {
      req.session.destroy();
      return errorResponse(res, 'Session invalid or account no longer exists.', 401);
    }

    if (!admin.isActive) {
      req.session.destroy();
      return errorResponse(res, 'Account has been deactivated. Contact SuperAdmin.', 403);
    }

    if (admin.isLocked()) {
      req.session.destroy();
      return errorResponse(res, 'Account is temporarily locked due to failed attempts. Try again later.', 423);
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (err) {
    return errorResponse(res, 'Authentication error.', 500);
  }
}

module.exports = {
  requireAuth
};

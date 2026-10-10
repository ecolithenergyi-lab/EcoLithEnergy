const User = require('../models/User');
const { errorResponse } = require('../utils/response');

async function requireCustomer(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return errorResponse(res, 'Customer authentication required. Please log in.', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      if (req.session?.userId) req.session.destroy();
      return errorResponse(res, 'Session invalid or user no longer exists.', 401);
    }

    if ((req.session.authVersion || 0) !== (user.authVersion || 0)) {
      req.session.destroy(() => {});
      return errorResponse(res, 'Your credentials changed. Please log in again.', 401);
    }

    if (!user.isActive) {
      if (req.session?.userId) req.session.destroy();
      return errorResponse(res, 'This account is inactive. Please contact support.', 403);
    }

    if (user.isLocked()) {
      if (req.session?.userId) req.session.destroy();
      return errorResponse(res, 'Account temporarily locked due to multiple failed login attempts.', 423);
    }

    req.customer = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication error.', 500);
  }
}

module.exports = {
  requireCustomer
};

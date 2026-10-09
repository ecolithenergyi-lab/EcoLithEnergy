const { errorResponse } = require('../utils/response');

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.admin) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.admin.role}' does not have sufficient permission for this action.`,
        403
      );
    }

    next;
    next();
  };
}

module.exports = {
  requireRole,
  isSuperAdmin: requireRole(['SUPER_ADMIN']),
  isAdminOrAbove: requireRole(['SUPER_ADMIN', 'ADMIN']),
  isEditorOrAbove: requireRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
};

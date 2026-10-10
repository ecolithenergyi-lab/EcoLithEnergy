const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const Gallery = require('../models/Gallery');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

// Admin Dashboard stats
async function getDashboardStats(req, res) {
  try {
    const [
      totalProducts,
      publishedProducts,
      totalInquiries,
      newInquiries,
      convertedInquiries,
      totalReviews,
      galleryImages,
      recentInquiries
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isPublished: true }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'NEW' }),
      Inquiry.countDocuments({ status: 'CONVERTED' }),
      Review.countDocuments(),
      Gallery.countDocuments(),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    return successResponse(res, {
      totalProducts,
      publishedProducts,
      totalInquiries,
      newInquiries,
      convertedInquiries,
      totalReviews,
      galleryImages,
      recentInquiries
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch dashboard statistics.', 500);
  }
}

// Admin Users: List (SUPER_ADMIN only)
async function getAdmins(req, res) {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 }).lean();
    return successResponse(res, admins.map(a => {
      delete a.passwordHash;
      return a;
    }));
  } catch (err) {
    return errorResponse(res, 'Failed to fetch admins.', 500);
  }
}

// Admin Users: Create (SUPER_ADMIN only)
async function createAdminUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const existing = await Admin.findOne({ email: cleanEmail });
    if (existing) {
      return errorResponse(res, 'An admin with this email already exists.', 409);
    }

    const passwordHash = await Admin.hashPassword(password);
    const newAdmin = await Admin.create({
      name,
      email: cleanEmail,
      passwordHash,
      role: role || 'ADMIN',
      isActive: true
    });

    logAudit({
      admin: req.admin,
      action: 'ADMIN_CREATE',
      resource: 'ADMIN_USER',
      resourceId: newAdmin._id,
      details: { email: newAdmin.email, role: newAdmin.role },
      req
    });

    return successResponse(res, newAdmin.toJSON(), 201, 'Admin user created successfully.');
  } catch (err) {
    return errorResponse(res, `Failed to create admin: ${err.message}`, 400);
  }
}

// Admin Users: Update (SUPER_ADMIN only)
async function updateAdminUser(req, res) {
  try {
    const { id } = req.params;
    const adminToUpdate = await Admin.findById(id);

    if (!adminToUpdate) {
      return errorResponse(res, 'Admin user not found.', 404);
    }

    // Prevent deactivating own account
    if (req.admin._id.toString() === id && req.body.isActive === false) {
      return errorResponse(res, 'You cannot deactivate your own account.', 400);
    }

    if (req.body.name) adminToUpdate.name = req.body.name;
    if (req.body.role) adminToUpdate.role = req.body.role;
    if (req.body.isActive !== undefined) adminToUpdate.isActive = req.body.isActive;
    if (req.body.password) {
      adminToUpdate.passwordHash = await Admin.hashPassword(req.body.password);
    }

    await adminToUpdate.save();

    logAudit({
      admin: req.admin,
      action: 'ADMIN_UPDATE',
      resource: 'ADMIN_USER',
      resourceId: adminToUpdate._id,
      details: { email: adminToUpdate.email },
      req
    });

    return successResponse(res, adminToUpdate.toJSON(), 200, 'Admin updated successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to update admin.', 400);
  }
}

// Admin Users: Delete (SUPER_ADMIN only)
async function deleteAdminUser(req, res) {
  try {
    const { id } = req.params;

    if (req.admin._id.toString() === id) {
      return errorResponse(res, 'You cannot delete your own account.', 400);
    }

    const adminToDelete = await Admin.findById(id);
    if (!adminToDelete) {
      return errorResponse(res, 'Admin user not found.', 404);
    }

    await Admin.findByIdAndDelete(id);

    logAudit({
      admin: req.admin,
      action: 'ADMIN_DELETE',
      resource: 'ADMIN_USER',
      resourceId: id,
      details: { email: adminToDelete.email },
      req
    });

    return successResponse(res, null, 200, 'Admin deleted successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete admin.', 500);
  }
}

// Audit Logs: List (SUPER_ADMIN and ADMIN)
async function getAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { resource, action } = req.query;

    const filter = {};
    if (resource && resource !== 'ALL') filter.resource = resource;
    if (action && action !== 'ALL') filter.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter)
    ]);

    return paginatedResponse(res, logs, { page, limit, total });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch audit logs.', 500);
  }
}

module.exports = {
  getDashboardStats,
  getAdmins,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAuditLogs
};

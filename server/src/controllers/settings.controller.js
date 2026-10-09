const SiteSettings = require('../models/SiteSettings');
const { successResponse, errorResponse } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

// Public: Get site settings
async function getPublicSettings(req, res) {
  try {
    let settings = await SiteSettings.findOne().lean();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return successResponse(res, settings);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch site settings.', 500);
  }
}

// Admin: Get site settings
async function getAdminSettings(req, res) {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return successResponse(res, settings);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch settings.', 500);
  }
}

// Admin: Update site settings
async function updateSettings(req, res) {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    logAudit({
      admin: req.admin,
      action: 'SETTINGS_UPDATE',
      resource: 'SITE_SETTINGS',
      resourceId: settings._id,
      details: req.body,
      req
    });

    return successResponse(res, settings, 200, 'Site settings updated successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to update settings.', 400);
  }
}

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateSettings
};

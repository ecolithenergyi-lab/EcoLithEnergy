const AuditLog = require('../models/AuditLog');
const { hashIp } = require('../utils/sanitize');
const logger = require('../utils/logger');

async function logAudit({ admin, action, resource, resourceId = '', details = {}, req = null }) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    const ipHash = hashIp(ip);
    const userAgent = req ? (req.headers['user-agent'] || '').substring(0, 200) : '';

    await AuditLog.create({
      adminId: admin ? admin._id : null,
      adminName: admin ? admin.name : 'System',
      action,
      resource,
      resourceId: String(resourceId),
      details,
      ipHash,
      userAgent,
      timestamp: new Date()
    });

    logger.audit(`Action: ${action} on ${resource} [ID: ${resourceId}] by ${admin ? admin.email : 'System'}`);
  } catch (err) {
    logger.error(`Failed to record audit log: ${err.message}`);
  }
}

module.exports = {
  logAudit
};

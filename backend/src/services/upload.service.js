const path = require('path');
const fs = require('fs');
const env = require('../config/env');

function getFileUrl(filename) {
  return `/uploads/${filename}`;
}

function deleteUploadedFile(fileUrl) {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return false;
    const filename = path.basename(fileUrl);
    const fullPath = path.join(env.UPLOAD_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (err) {
    // Non-fatal cleanup failure
  }
  return false;
}

module.exports = {
  getFileUrl,
  deleteUploadedFile
};

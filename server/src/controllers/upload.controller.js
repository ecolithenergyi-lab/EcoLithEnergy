const { successResponse, errorResponse } = require('../utils/response');
const { getFileUrl } = require('../services/upload.service');
const { logAudit } = require('../middleware/audit');

async function handleFileUpload(req, res) {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file uploaded.', 400);
    }

    const fileUrl = getFileUrl(req.file.filename);

    logAudit({
      admin: req.admin,
      action: 'IMAGE_UPLOAD',
      resource: 'UPLOAD',
      resourceId: req.file.filename,
      details: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: fileUrl
      },
      req
    });

    return successResponse(res, {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }, 201, 'Image uploaded successfully.');
  } catch (err) {
    return errorResponse(res, 'Image upload failed.', 500);
  }
}

module.exports = {
  handleFileUpload
};

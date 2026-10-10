const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { requireAuth } = require('../middleware/auth');
const { isEditorOrAbove } = require('../middleware/admin');
const { upload, postUploadValidation } = require('../middleware/uploadSecurity');

// Upload single image (Protected)
router.post(
  '/',
  requireAuth,
  isEditorOrAbove,
  upload.single('image'),
  postUploadValidation,
  uploadController.handleFileUpload
);

module.exports = router;

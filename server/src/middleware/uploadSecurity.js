const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');
const { errorResponse } = require('../utils/response');

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Storage configuration with sanitized random filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.jpg';
    const randomName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${cleanExt}`;
    cb(null, randomName);
  }
});

// Multer filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid file extension. Only JPG, PNG, and WEBP images are allowed.'), false);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    return cb(new Error('Invalid MIME type. Only JPG, PNG, and WEBP images are allowed.'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 // 5MB
  },
  fileFilter
});

/**
 * Verify Magic Numbers (file signatures) to prevent spoofed extensions/content
 */
function verifyMagicBytes(filePath) {
  try {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    // JPEG signature: FF D8 FF
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    // WEBP signature: RIFF....WEBP
    const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
    const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';

    return isJpeg || isPng || (isRiff && isWebp);
  } catch (err) {
    return false;
  }
}

/**
 * Middleware to post-verify uploaded file headers and remove file if malicious
 */
function postUploadValidation(req, res, next) {
  if (!req.file) return next();

  const filePath = req.file.path;
  const isValid = verifyMagicBytes(filePath);

  if (!isValid) {
    // Delete suspicious file immediately
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}
    return errorResponse(res, 'File verification failed. The file is not a valid image format.', 400);
  }

  next();
}

module.exports = {
  upload,
  postUploadValidation,
  verifyMagicBytes
};

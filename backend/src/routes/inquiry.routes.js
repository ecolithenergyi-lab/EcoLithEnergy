const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const { inquiryLimiter } = require('../middleware/rateLimit');
const { validateBody } = require('../middleware/validation');
const { inquiryCreateSchema } = require('../validators/inquiry.validator');

// Public Contact Form Submission (Rate-limited, sanitized & validated)
router.post('/', inquiryLimiter, validateBody(inquiryCreateSchema), inquiryController.createInquiry);

module.exports = router;

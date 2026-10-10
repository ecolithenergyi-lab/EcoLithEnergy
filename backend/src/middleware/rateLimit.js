const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests from this IP. Please try again after 15 minutes.', 429);
  }
});

// Inquiry form limiter: prevent spam submissions
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // max 15 submissions per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Enquiry submission limit reached. Please call or WhatsApp us directly.', 429);
  }
});

module.exports = {
  apiLimiter,
  inquiryLimiter
};

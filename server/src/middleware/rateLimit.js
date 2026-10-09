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

// Customer login/signup rate limiter: strict protection against brute force
const customerAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many authentication attempts from this IP. Please try again after a few minutes.', 429);
  }
});

// Admin login rate limiter: strict protection against brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many failed login attempts from this IP. Access temporarily restricted.', 429);
  }
});

module.exports = {
  apiLimiter,
  inquiryLimiter,
  customerAuthLimiter,
  loginLimiter
};

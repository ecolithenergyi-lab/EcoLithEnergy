const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api')) {
    return errorResponse(res, `API route '${req.method} ${req.path}' not found.`, 404);
  }
  next();
}

function errorHandler(err, req, res, next) {
  logger.error(`Unhandled error on ${req.method} ${req.path}: ${err.message}`, {
    stack: err.stack
  });

  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File is too large. Maximum allowed size is 5MB.', 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid resource identifier: ${err.value}`, 400);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `A record with this ${field} already exists.`, 409);
  }

  // Handle Custom validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return errorResponse(res, messages[0] || 'Validation failed.', 400, messages);
  }

  // Safe fallback response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal server error.';

  return errorResponse(res, message, statusCode);
}

module.exports = {
  notFoundHandler,
  errorHandler
};

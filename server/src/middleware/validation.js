const { errorResponse } = require('../utils/response');

const validateBody = (schema, { includeErrors = false } = {}) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.errors) {
      const issues = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return errorResponse(res, issues[0] || 'Invalid input data.', 400, issues, includeErrors);
    }
    return errorResponse(res, 'Validation error.', 400);
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.query = parsed;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid query parameters.', 400);
  }
};

module.exports = {
  validateBody,
  validateQuery
};

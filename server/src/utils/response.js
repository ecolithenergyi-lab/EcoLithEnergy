const successResponse = (res, data, statusCode = 200, message = null) => {
  const payload = { success: true };
  if (message) payload.message = message;
  payload.data = data;
  return res.status(statusCode).json(payload);
};

const paginatedResponse = (res, data, pagination, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      page: Number(pagination.page),
      limit: Number(pagination.limit),
      total: Number(pagination.total),
      pages: Math.ceil(pagination.total / pagination.limit) || 1
    }
  });
};

const errorResponse = (res, message = 'Something went wrong.', statusCode = 500, errors = null, includeErrors = false) => {
  const payload = {
    success: false,
    message
  };
  if (errors && (includeErrors || process.env.NODE_ENV !== 'production')) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse
};

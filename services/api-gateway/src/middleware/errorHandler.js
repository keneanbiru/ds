/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Gateway Error:', err);

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err.name || 'INTERNAL_ERROR',
  });
}

module.exports = errorHandler;

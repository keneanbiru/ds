/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') {
    // Unique constraint violation (duplicate email)
    return res.status(409).json({
      success: false,
      message: 'Email already exists',
      error: 'DUPLICATE_EMAIL',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: 'VALIDATION_ERROR',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'AUTH_ERROR',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err.name || 'INTERNAL_ERROR',
  });
}

module.exports = errorHandler;

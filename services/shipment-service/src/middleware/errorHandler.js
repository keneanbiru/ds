/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      error: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === '23503') {
    // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      message: 'Invalid reference',
      error: 'FOREIGN_KEY_VIOLATION',
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

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err.name || 'INTERNAL_ERROR',
  });
}

module.exports = errorHandler;

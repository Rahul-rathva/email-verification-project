// errorHandler.js
// Central error handling middleware for Express
// Catches all errors thrown in route handlers or middleware
// Provides consistent error response format
// Logs errors to console for debugging

/**
 * Global error handler middleware
 * Must be added as the last middleware in Express app
 * Catches all errors and returns standardized response
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error caught:', {
    message: err.message,
    code: err.code,
    status: err.status,
    stack: err.stack
  });

  // Determine status code
  const status = err.status || err.statusCode || 500;
  
  // Return error response
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    status: status,
    timestamp: new Date().toISOString()
  });
}

/**
 * 404 Not Found middleware
 * Should be added before error handler, after all routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    status: 404
  });
}

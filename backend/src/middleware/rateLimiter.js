// rateLimiter.js
// Express middleware for rate limiting
// Prevents API abuse by limiting requests per IP address
// Uses express-rate-limit: tracks requests in memory, resets periodically
// Max 10 requests per minute per IP to prevent DOS attacks

import rateLimit from 'express-rate-limit';

// Rate limit configuration
// 10 requests per minute per IP address
// Store is in-memory (good for single server, use Redis for distributed)
// WindowMs: 60 seconds, Max: 10 requests
export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per windowMs
  message: 'Too many verification requests from this IP, please try again after a minute',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
  keyGenerator: (req) => {
    // Use client IP for rate limiting
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }
});

// Stricter rate limit for bulk verification (5 requests per minute)
export const bulkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // Only 5 bulk requests per minute
  message: 'Too many bulk verification requests, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false
});

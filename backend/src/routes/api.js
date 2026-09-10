// api.js
// Express routes for email verification API
// Implements 4 main endpoints:
// POST /api/verify - single email verification
// GET /api/history - last 20 verification results
// POST /api/bulk - multiple emails verification
// GET /api/stats - verification statistics
// All endpoints use rate limiting and return standardized responses

import express from 'express';
import mongoose from 'mongoose';
import { verifyEmail } from '../verifier/emailVerifier.js';
import VerificationResult from '../models/VerificationResult.js';
import { limiter, bulkLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/verify
 * Verify a single email address
 * Request: { email: "user@example.com" }
 * Response: Full verification result object
 * Rate limited: 10 requests per minute per IP
 */
router.post('/verify', limiter, async (req, res, next) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Email is required and must be a string',
        status: 400
      });
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Perform verification
    const result = await verifyEmail(sanitizedEmail);

    // Save to database for history
    const dbResult = new VerificationResult(result);
    await dbResult.save();

    // Return result
    res.json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bulk
 * Verify multiple email addresses at once
 * Request: { emails: ["user1@example.com", "user2@example.com"] }
 * Response: { results: [verificationResult, ...], count: number }
 * Rate limited: 5 requests per minute per IP (stricter than single verify)
 * Max 100 emails per request
 */
router.post('/bulk', bulkLimiter, async (req, res, next) => {
  try {
    const { emails } = req.body;

    // Input validation
    if (!Array.isArray(emails)) {
      return res.status(400).json({
        error: 'Emails must be an array',
        status: 400
      });
    }

    if (emails.length === 0) {
      return res.status(400).json({
        error: 'At least one email is required',
        status: 400
      });
    }

    if (emails.length > 100) {
      return res.status(400).json({
        error: 'Maximum 100 emails allowed per request',
        status: 400
      });
    }

    // Verify all emails (in parallel)
    const results = await Promise.all(
      emails.map(email => verifyEmail(email.trim().toLowerCase()))
    );

    // Save all results to database
    await VerificationResult.insertMany(results);

    // Return results
    res.json({
      count: results.length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/history
 * Get verification history (last 20 results)
 * Query params:
 *   - limit: max number of results (default 20, max 100)
 *   - email: filter by specific email (optional)
 * Response: { results: [verificationResult, ...], total: number }
 */
router.get('/history', limiter, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const email = req.query.email ? req.query.email.toLowerCase() : null;

    // Build query
    let query = {};
    if (email) {
      query.email = email;
    }

    // Fetch results sorted by timestamp descending
    const results = await VerificationResult.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    // Get total count
    const total = await VerificationResult.countDocuments(query);

    res.json({
      results: results,
      total: total,
      limit: limit,
      returned: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats
 * Get verification statistics from history
 * Returns counts of valid/invalid/unknown results
 * Response: { valid: number, invalid: number, unknown: number, total: number }
 */
router.get('/stats', limiter, async (req, res, next) => {
  try {
    // Aggregate results by result type
    const stats = await VerificationResult.aggregate([
      {
        $group: {
          _id: '$result',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get total count
    const total = await VerificationResult.countDocuments();

    // Format response
    const response = {
      valid: 0,
      invalid: 0,
      unknown: 0,
      total: total,
      timestamp: new Date().toISOString()
    };

    // Populate counts
    for (const stat of stats) {
      response[stat._id] = stat.count;
    }

    res.json(response);

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/health
 * Health check endpoint (not rate limited)
 * Returns status and database connection info
 * Used for monitoring and deployment health checks
 */
router.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'ok',
      message: 'Email verification API is running',
      database: mongoStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

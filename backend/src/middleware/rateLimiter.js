const rateLimit = require('express-rate-limit');

/**
 * Sensitive Auth Limiter
 * Applied to login, registration, verify-password, and change-password.
 * Defends against brute-force and credential-stuffing attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

/**
 * General API Rate Limiter
 * Guards against API scraping and volumetric DoS.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 400, // generous allowance for legitimate SPA polling and browsing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests received. Please slow down and try again shortly.'
  }
});

/**
 * Complaint Submission Limiter
 * Prevents automated grievance spamming while allowing normal citizen usage.
 */
const complaintLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 12, // max 12 submissions per 10 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many complaint submissions in a short period. Please wait a few minutes before submitting another issue.'
  }
});

module.exports = {
  authLimiter,
  apiLimiter,
  complaintLimiter
};

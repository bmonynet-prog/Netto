import rateLimit from 'express-rate-limit';

// Strict limiter for authentication endpoints (login/register) to slow down
// brute-force / credential-stuffing attempts.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

// General limiter for the whole API as a defense-in-depth measure.
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down' },
});

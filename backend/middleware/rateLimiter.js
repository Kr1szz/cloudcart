const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter - 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});

/**
 * Authentication rate limiter - 15 requests per 15 minutes for registration and login
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login/registration attempts, please try again after 15 minutes"
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};

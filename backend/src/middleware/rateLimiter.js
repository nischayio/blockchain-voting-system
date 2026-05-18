import rateLimit from "express-rate-limit";

// AUTHORIZATION RATE LIMITING
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message:
      "Too many auth requests. Please try again later.",
  },
});

// VOTING RATE LIMITING
export const voteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message:
      "Too many vote requests. Please try again later.",
  },
});
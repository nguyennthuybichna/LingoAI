const rateLimit = require('express-rate-limit');

const guestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 5,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: 'LIMIT_REACHED',
      message: 'Limit exceeded.'
    });
  }
});

const userLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 500,
  max: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  handler: (req, res) => {
    return res.status(429).json({
      error: 'LIMIT_REACHED',
      message: 'Limit exceeded.'
    });
  }
});

const translateRateLimiter = (req, res, next) => {
  if (req.user && req.user.id) {
    return userLimiter(req, res, next);
  } else {
    return guestLimiter(req, res, next);
  }
};

module.exports = {
  translateRateLimiter
};

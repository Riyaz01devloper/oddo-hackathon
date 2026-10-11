const ApiError = require("../utils/ApiError");

/**
 * In-memory sliding window rate limiter
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 15 mins)
 * @param {number} options.max - Max requests per IP in the window (default 100)
 * @param {string} options.message - Error message
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100;
  const message = options.message || "Too many requests from this IP, please try again later.";
  const hits = new Map();

  // Periodically clean up expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now - record.startTime > windowMs) {
        hits.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const record = hits.get(ip);
    if (!record || now - record.startTime > windowMs) {
      hits.set(ip, { count: 1, startTime: now });
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      res.setHeader("Retry-After", Math.ceil((record.startTime + windowMs - now) / 1000));
      return next(new ApiError(429, message));
    }

    return next();
  };
};

module.exports = rateLimiter;


/**
 * Security headers middleware to harden HTTP responses
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Enable XSS filter in browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Enforce HTTPS
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  // Limit referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Disable caching for sensitive API responses
  if (req.path.startsWith("/api/users")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
};

module.exports = securityHeaders;


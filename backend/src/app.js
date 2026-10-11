const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const securityHeaders = require('./middlewares/securityHeaders.middleware.js');
const ApiResponse = require('./utils/ApiResponse.js');

const app = express();

// Security HTTP headers
app.use(securityHeaders);

// Parse cookies and request bodies
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Dynamic CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://oddo-hackathon-zeta.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isVercelPreview = /^https:\/\/oddo-hackathon.*\.vercel\.app$/.test(origin);

    if (isExplicitlyAllowed || isVercelPreview) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Health check endpoints for Render/monitoring
app.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, { status: "healthy", timestamp: new Date() }, "API is healthy"));
});
app.get('/api/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, { status: "healthy", timestamp: new Date() }, "API is healthy"));
});

// Route modules
const userRoutes = require('./routes/user.routes.js');
const driverRoutes = require('./routes/driver.routes.js');
const vehicleRoutes = require('./routes/vehicle.routes.js');
const tripRoutes = require('./routes/trip.routes.js');
const expenseRoutes = require('./routes/expense.routes.js');
const fuelRoutes = require('./routes/fuel.routes.js');
const maintenanceRoutes = require('./routes/maintenance.routes.js');
const reportRoutes = require('./routes/report.routes.js');

app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/fuel-logs', fuelRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', reportRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json(
    new ApiResponse(404, null, `Route not found: ${req.method} ${req.originalUrl}`)
  );
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // Normalize authentication errors
  let statusCode = err.statusCode;
  let message = err.message || 'Internal server error';

  if (!statusCode) {
    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Authentication token has expired. Please log in again.';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid authentication token.';
    } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
      statusCode = 400;
      message = `Invalid ID format for ${err.path}`;
    } else if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors).map(e => e.message).join(', ');
    } else {
      statusCode = 500;
    }
  }

  const errors = err.errors || [];

  res.status(statusCode).json({
    statusCode,
    data: null,
    message,
    success: false,
    errors: errors.length > 0 ? errors : [message]
  });
});

module.exports = app;
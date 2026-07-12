const express = require('express');
const cors = require("cors");

const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "https://transopt-omega.vercel.app",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./routes/user.routes.js');
const driverRoutes = require('./routes/driver.routes.js');
const vehicleRoutes = require('./routes/vehicle.routes.js');
const tripRoutes = require('./routes/trip.routes.js');
const expenseRoutes = require('./routes/expense.routes.js');
const fuelRoutes = require('./routes/fuel.routes.js');
const maintenanceRoutes = require('./routes/maintenance.routes.js');
const reportRoutes = require('./routes/report.routes.js');
const ApiResponse = require('./utils/ApiResponse.js');

app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/fuel-logs', fuelRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', reportRoutes);

app.use((req, res) => {
    res.status(404).json(
        new ApiResponse(404, null, 'Route not found')
    );
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    const errors = err.errors || [];
    
    res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false,
        errors
    });
});

module.exports = app;
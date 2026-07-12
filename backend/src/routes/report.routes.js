const express = require('express');
const router = express.Router();

const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');

router.get('/', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Reports endpoint ready',
    data: {
      totalVehicles: 0,
      activeTrips: 0,
      maintenancePending: 0
    }
  });
});

router.get('/dashboard', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dashboard stats ready',
    data: {
      totalVehicles: 0,
      activeTrips: 0,
      maintenancePending: 0
    }
  });
});

module.exports = router;

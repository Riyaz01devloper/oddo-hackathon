const express = require('express');
const router = express.Router();

const {
  fuelEfficiency,
  fleetUtilization,
  operationalCost,
  vehicleROI
} = require('../controllers/analytics.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');
const { validateObjectId } = require('../middlewares/validator.middleware.js');

router.get('/analytics/fuel-efficiency', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), fuelEfficiency);
router.get('/analytics/fuel-efficiency/:vehicleId', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), validateObjectId('vehicleId'), fuelEfficiency);
router.get('/analytics/fleet-utilization', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), fleetUtilization);
router.get('/analytics/operational-cost', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), operationalCost);
router.get('/analytics/vehicle-roi', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), vehicleROI);
router.get('/analytics/vehicle-roi/:vehicleId', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), validateObjectId('vehicleId'), vehicleROI);

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

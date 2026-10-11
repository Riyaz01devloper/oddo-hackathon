const express = require('express');
const router = express.Router();

const {
  addFuelLog,
  getAllFuelLogs,
  getFuelLogsByVehicle,
  deleteFuelLog,
} = require('../controllers/fuelLog.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');

router.post('/', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer'), addFuelLog);
router.get('/', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getAllFuelLogs);
router.get('/:vehicleId', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getFuelLogsByVehicle);
router.delete('/:id', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer'), deleteFuelLog);

module.exports = router;

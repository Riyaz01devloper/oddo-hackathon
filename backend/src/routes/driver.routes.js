const express = require('express');
const router = express.Router();

const {
  registerDriver,
  getAllDrivers,
  getDriverById,
  getAvailableDrivers,
  getOnTripDrivers,
  getOffDutyDrivers,
  getSuspendedDrivers,
  deleteDriver,
  updateDriver
} = require('../controllers/driver.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');

router.post('/', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer'), registerDriver);
router.get('/', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getAllDrivers);
router.get('/available', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getAvailableDrivers);
router.get('/on-trip', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getOnTripDrivers);
router.get('/off-duty', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getOffDutyDrivers);
router.get('/suspended', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getSuspendedDrivers);
router.get('/:id', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getDriverById);
router.put('/:id', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer'), updateDriver);
router.delete('/:id', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer'), deleteDriver);

module.exports = router;

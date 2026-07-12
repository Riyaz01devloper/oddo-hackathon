const express = require('express');
const router = express.Router();

const {
  getAllTrips,
  draftTrip,
  dispatchTrip,
  finishTrip,
  cancelTrip
} = require('../controllers/trip.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');

router.get('/', verifyJWT, authorizeRoles('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'), getAllTrips);
router.post('/', verifyJWT, authorizeRoles('Fleet Manager', 'Driver'), draftTrip);
router.patch('/:tripId/dispatch', verifyJWT, authorizeRoles('Fleet Manager', 'Driver'), dispatchTrip);
router.patch('/:tripId/complete', verifyJWT, authorizeRoles('Fleet Manager', 'Driver'), finishTrip);
router.patch('/:tripId/cancel', verifyJWT, authorizeRoles('Fleet Manager', 'Driver'), cancelTrip);

module.exports = router;

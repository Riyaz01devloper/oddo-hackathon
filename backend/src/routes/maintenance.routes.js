const express = require('express');
const router = express.Router();

const {
  createMaintenance,
  closeMaintenance
} = require('../controllers/maintaince.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');

router.post('/', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer'), createMaintenance);
router.patch('/:id/close', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer'), closeMaintenance);

module.exports = router;

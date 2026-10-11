const express = require('express');
const router = express.Router();

const { getAuditLogs } = require('../controllers/auditLog.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');

// Protected audit logs for Fleet Manager and Safety Officer
router.get('/', verifyJWT, authorizeRoles('Fleet Manager', 'Safety Officer'), getAuditLogs);

module.exports = router;


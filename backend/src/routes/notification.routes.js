const express = require('express');
const router = express.Router();

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
} = require('../controllers/notification.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');

router.get('/', verifyJWT, getNotifications);
router.patch('/:id/read', verifyJWT, markAsRead);
router.patch('/read-all', verifyJWT, markAllAsRead);

module.exports = router;


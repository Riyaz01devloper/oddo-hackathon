const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateMe,
    changePassword,
    getAllUsers
} = require('../controllers/user.controllers.js');

const validateRegister = require('../middlewares/validator.middleware.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');
const rateLimiter = require('../middlewares/rateLimiter.middleware.js');

// Rate limit authentication attempts (20 attempts per 15 minutes per IP)
const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many authentication attempts. Please try again after 15 minutes."
});

// Auth endpoints
router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.delete('/logout', verifyJWT, logoutUser);

// Profile endpoints (Derived strictly from verified JWT)
router.get('/me', verifyJWT, getMe);
router.get('/profile', verifyJWT, getMe);
router.patch('/me', verifyJWT, updateMe);
router.patch('/me/password', verifyJWT, changePassword);

// User Directory (Restricted to Fleet Manager)
router.get('/', verifyJWT, authorizeRoles('Fleet Manager'), getAllUsers);

module.exports = router;

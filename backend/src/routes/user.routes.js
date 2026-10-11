const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logoutUser } = require('../controllers/user.controllers.js');
const validateRegister = require('../middlewares/validator.middleware.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');
const rateLimiter = require('../middlewares/rateLimiter.middleware.js');
const ApiResponse = require('../utils/ApiResponse.js');

// Rate limit authentication attempts (20 attempts per 15 minutes per IP)
const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many authentication attempts. Please try again after 15 minutes."
});

router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.delete('/logout', verifyJWT, logoutUser);

router.get('/profile', verifyJWT, authorizeRoles('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'), (req, res) => {
    res.status(200).json(
        new ApiResponse(200, req.user, "User profile fetched successfully")
    );
});

module.exports = router;

const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logoutUser } = require('../controllers/user.controllers.js');
const validateRegister = require('../middlewares/validator.middleware.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const authorizeRoles = require('../middlewares/role.middleware.js');

router.post('/register', validateRegister, registerUser);
router.post('/login', loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.get('/profile', verifyJWT, authorizeRoles('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'), (req, res) => {
    res.status(200).json({ success: true, data: req.user });
});

module.exports = router;

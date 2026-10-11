const express = require('express');
const router = express.Router();

const { askCopilot } = require('../controllers/ai.controller.js');
const verifyJWT = require('../middlewares/auth.middleware.js');
const rateLimiter = require('../middlewares/rateLimiter.middleware.js');

// Rate limit AI requests (30 requests per minute per IP)
const aiLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "AI rate limit exceeded. Please wait a moment before sending another query."
});

router.post('/ask', verifyJWT, aiLimiter, askCopilot);

module.exports = router;


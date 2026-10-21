const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const { aiChatLimiter } = require('../middleware/rateLimiter');

// @route POST /api/ai/chat
// Rate limited specifically for AI conversational requests
router.post('/chat', aiChatLimiter, chatWithAI);

module.exports = router;

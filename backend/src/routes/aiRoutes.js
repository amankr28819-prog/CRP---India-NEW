const express = require('express');
const router = express.Router();
const { chatWithAI, getComplaintTrackingSummary } = require('../controllers/aiController');
const { aiChatLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');

// @route POST /api/ai/chat
// Rate limited specifically for AI conversational requests
router.post('/chat', aiChatLimiter, chatWithAI);

// @route POST /api/ai/track-summary
// Authenticated endpoint for citizen AI complaint status tracking summary
router.post('/track-summary', verifyToken, aiChatLimiter, getComplaintTrackingSummary);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/authorityController');
const { verifyToken, isAuthority } = require('../middleware/auth');

router.get('/dashboard', verifyToken, isAuthority, getDashboardStats);

module.exports = router;
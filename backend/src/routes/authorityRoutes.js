const express = require('express');
const router = express.Router();
const { getDashboardStats, getDeletedComplaints } = require('../controllers/authorityController');
const { verifyToken, isAuthority } = require('../middleware/auth');

router.get('/dashboard', verifyToken, isAuthority, getDashboardStats);
router.get('/deleted-complaints', verifyToken, isAuthority, getDeletedComplaints);

module.exports = router;
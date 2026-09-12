const express = require('express');
const router = express.Router();
const { getDashboardStats, getDeletedComplaints, getDepartmentOfficers } = require('../controllers/authorityController');
const { verifyToken, isAuthority } = require('../middleware/auth');

router.get('/dashboard', verifyToken, isAuthority, getDashboardStats);
router.get('/deleted-complaints', verifyToken, isAuthority, getDeletedComplaints);
router.get('/officers', verifyToken, isAuthority, getDepartmentOfficers);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaintByRefId,
  getComplaints,
  getCitizenDashboardStats,
  getMyComplaints,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  voteOnComplaint,
  flagComplaintAsMisinformation,
  flagComplaintAsDuplicate,
  removeComplaintFlag
} = require('../controllers/complaintController');
const { verifyToken, isAuthority, isCitizen, checkSuspension, optionalAuth } = require('../middleware/auth');
const { complaintLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

// Public or Citizen routes
router.post('/', verifyToken, complaintLimiter, upload.array('images', 3), createComplaint);
router.get('/', optionalAuth, getComplaints);
router.get('/dashboard-stats', optionalAuth, getCitizenDashboardStats);
router.get('/my', verifyToken, getMyComplaints);
router.get('/:referenceId', optionalAuth, getComplaintByRefId);
router.delete('/:id', verifyToken, deleteComplaint);

// Citizen Voting route
router.post('/:id/vote', verifyToken, isCitizen, checkSuspension, voteOnComplaint);

// Authority protected routes
router.patch('/:id/status', verifyToken, isAuthority, upload.single('resolutionPhoto'), updateComplaintStatus);
router.patch('/:id/assign', verifyToken, isAuthority, assignComplaint);

// Administrative Flagging routes (Municipal Authority only)
router.post('/:id/flag-misinformation', verifyToken, isAuthority, flagComplaintAsMisinformation);
router.post('/:id/flag-duplicate', verifyToken, isAuthority, flagComplaintAsDuplicate);
router.post('/:id/remove-flag', verifyToken, isAuthority, removeComplaintFlag);

module.exports = router;
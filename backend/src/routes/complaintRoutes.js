const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaintByRefId,
  getComplaints,
  getMyComplaints,
  updateComplaintStatus,
  assignComplaint
} = require('../controllers/complaintController');
const { verifyToken, isAuthority, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public or Citizen routes
router.post('/', verifyToken, upload.array('images', 3), createComplaint);
router.get('/', optionalAuth, getComplaints);
router.get('/my', verifyToken, getMyComplaints);
router.get('/:referenceId', getComplaintByRefId);

// Authority protected routes
router.patch('/:id/status', verifyToken, isAuthority, upload.single('resolutionPhoto'), updateComplaintStatus);
router.patch('/:id/assign', verifyToken, isAuthority, assignComplaint);

module.exports = router;
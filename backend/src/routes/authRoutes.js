const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  verifyPassword,
  changePassword,
  verifyCitizenReset,
  confirmCitizenPasswordReset,
  updateSettings
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { passwordResetLimiter } = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

// Citizen Password Reset Flow (Protected with dedicated rate limiter)
router.post('/reset-password/verify', passwordResetLimiter, verifyCitizenReset);
router.post('/reset-password/confirm', passwordResetLimiter, confirmCitizenPasswordReset);

// Citizen Account Management (Protected)
router.patch('/profile', verifyToken, updateProfile);
router.patch('/profile-picture', verifyToken, upload.single('avatar'), uploadProfilePicture);
router.delete('/profile-picture', verifyToken, removeProfilePicture);
router.post('/verify-password', verifyToken, verifyPassword);
router.patch('/change-password', verifyToken, changePassword);
router.patch('/settings', verifyToken, updateSettings);

module.exports = router;
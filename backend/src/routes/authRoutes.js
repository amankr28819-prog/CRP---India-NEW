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
  updateSettings,
  getGoogleConfig,
  googleAuth,
  googleLink,
  googleOnboard
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// Credential-sensitive authentication endpoints protected by authLimiter
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', verifyToken, getMe);

// Google Sign-In Flow for Citizens (Credential operations protected by authLimiter)
router.get('/google/config', getGoogleConfig);
router.post('/google', authLimiter, googleAuth);
router.post('/google/link', authLimiter, googleLink);
router.post('/google/onboard', authLimiter, googleOnboard);

// Citizen Password Reset Flow (Protected with dedicated passwordResetLimiter)
router.post('/reset-password/verify', passwordResetLimiter, verifyCitizenReset);
router.post('/reset-password/confirm', passwordResetLimiter, confirmCitizenPasswordReset);

// Citizen Account Management (Protected by verifyToken; password verification/change protected by authLimiter)
router.patch('/profile', verifyToken, updateProfile);
router.patch('/profile-picture', verifyToken, upload.single('avatar'), uploadProfilePicture);
router.delete('/profile-picture', verifyToken, removeProfilePicture);
router.post('/verify-password', verifyToken, authLimiter, verifyPassword);
router.patch('/change-password', verifyToken, authLimiter, changePassword);
router.patch('/settings', verifyToken, updateSettings);

module.exports = router;
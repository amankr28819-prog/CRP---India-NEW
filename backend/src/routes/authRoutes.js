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
  updateSettings
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

// Citizen Account Management (Protected)
router.patch('/profile', verifyToken, updateProfile);
router.patch('/profile-picture', verifyToken, upload.single('avatar'), uploadProfilePicture);
router.delete('/profile-picture', verifyToken, removeProfilePicture);
router.post('/verify-password', verifyToken, verifyPassword);
router.patch('/change-password', verifyToken, changePassword);
router.patch('/settings', verifyToken, updateSettings);

module.exports = router;
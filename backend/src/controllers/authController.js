const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[SECURITY FATAL] JWT_SECRET must be defined in production environment variables.');
    }
    return 'crp_india_super_secret_jwt_key_2026_dev_secure';
  }
  return secret;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc Register citizen
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, voterId, agreedToTerms } = req.body;

    if (!name || !email || !password || !voterId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, valid email, password, and Voter ID.'
      });
    }

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof voterId !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'All form fields must be valid text.'
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be between 2 and 100 characters in length.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 6 and 128 characters long.'
      });
    }

    const cleanVoterId = voterId.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(cleanVoterId)) {
      return res.status(400).json({
        success: false,
        message: 'Voter ID must be a 10-digit alphanumeric code (e.g. ABC1234567).'
      });
    }

    if (phone && typeof phone === 'string') {
      const cleanPhone = phone.trim();
      if (cleanPhone && !/^[+]?[0-9\s\-()]{7,20}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid telephone or mobile number.'
        });
      }
    }

    if (agreedToTerms !== true && agreedToTerms !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the Terms & Conditions and Privacy Policy to create an account.'
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const existingVoter = await User.findOne({ voterId: cleanVoterId });
    if (existingVoter) {
      return res.status(400).json({
        success: false,
        message: 'An account with this Voter ID already exists.'
      });
    }

    const user = await User.create({
      name: trimmedName,
      email: cleanEmail,
      password,
      phone: (typeof phone === 'string' ? phone.trim() : '') || '',
      voterId: cleanVoterId,
      role: 'citizen',
      agreedToTerms: true
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully.',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        voterId: user.voterId,
        role: user.role,
        avatar: user.avatar || '',
        settings: user.settings,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Login user (citizen or authority)
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, expectedRole, voterId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email address and password.'
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password must be valid text.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Citizen login requires a 10-digit alphanumeric Voter ID
    if (expectedRole === 'citizen') {
      if (!voterId || typeof voterId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Voter ID is required for citizen sign in.'
        });
      }
      const cleanVoterId = voterId.trim().toUpperCase();
      if (!/^[A-Z0-9]{10}$/.test(cleanVoterId)) {
        return res.status(400).json({
          success: false,
          message: 'Voter ID must be a 10-digit alphanumeric code (e.g. ABC1234567).'
        });
      }
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or credentials.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your password.'
      });
    }

    // Validate citizen Voter ID against record
    if (user.role === 'citizen') {
      if (!voterId) {
        return res.status(400).json({
          success: false,
          message: 'Voter ID is required for citizen sign in.'
        });
      }
      const cleanVoterId = voterId.trim().toUpperCase();
      if (!/^[A-Z0-9]{10}$/.test(cleanVoterId)) {
        return res.status(400).json({
          success: false,
          message: 'Voter ID must be a 10-digit alphanumeric code (e.g. ABC1234567).'
        });
      }
      if (user.voterId && user.voterId.toUpperCase() !== cleanVoterId) {
        return res.status(401).json({
          success: false,
          message: 'Voter ID does not match the registered citizen record.'
        });
      }
    }

    // If logging in through authority portal, ensure the account has authority privileges
    if (expectedRole === 'authority' && user.role !== 'authority') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: This account does not have Municipal Authority clearance.'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        voterId: user.voterId || '',
        role: user.role,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar || '',
        settings: user.settings,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get current logged-in user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// @desc Update user profile details (e.g. name)
// @route PATCH /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be text.'
      });
    }

    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters in length.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    user.name = cleanName;
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        voterId: user.voterId || '',
        role: user.role,
        avatar: user.avatar || '',
        settings: user.settings,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Upload or change citizen profile picture
// @route PATCH /api/auth/profile-picture
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo updated successfully.',
      avatar: user.avatar,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        voterId: user.voterId || '',
        role: user.role,
        avatar: user.avatar,
        settings: user.settings,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Remove profile picture (reset to default)
// @route DELETE /api/auth/profile-picture
const removeProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    user.avatar = '';
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo removed successfully.',
      avatar: '',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        voterId: user.voterId || '',
        role: user.role,
        avatar: '',
        settings: user.settings,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Verify password to reveal masked dummy Voter ID
// @route POST /api/auth/verify-password
const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be text.'
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password exceeds maximum length.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Verification failed.'
      });
    }

    res.json({
      success: true,
      message: 'Password verified successfully.',
      voterId: user.voterId || ''
    });
  } catch (err) {
    next(err);
  }
};

// @desc Change user password
// @route PATCH /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      (confirmPassword && typeof confirmPassword !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password as valid text.'
      });
    }

    if (newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'New password must be between 6 and 128 characters long.'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be identical to current password.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match registered account password.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update user preferences (notifications, theme, accessibility)
// @route PATCH /api/auth/settings
const updateSettings = async (req, res, next) => {
  try {
    const { notifications, theme, accessibility } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (!user.settings) {
      user.settings = {
        notifications: { emailUpdates: true, complaintStatus: true },
        theme: 'light',
        accessibility: { reducedMotion: false, highContrast: false }
      };
    }

    if (notifications) {
      user.settings.notifications = {
        emailUpdates: notifications.emailUpdates !== undefined ? notifications.emailUpdates : user.settings.notifications?.emailUpdates,
        complaintStatus: notifications.complaintStatus !== undefined ? notifications.complaintStatus : user.settings.notifications?.complaintStatus
      };
    }

    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      user.settings.theme = theme;
    }

    if (accessibility) {
      user.settings.accessibility = {
        reducedMotion: accessibility.reducedMotion !== undefined ? accessibility.reducedMotion : user.settings.accessibility?.reducedMotion,
        highContrast: accessibility.highContrast !== undefined ? accessibility.highContrast : user.settings.accessibility?.highContrast
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully.',
      settings: user.settings
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  verifyPassword,
  changePassword,
  updateSettings
};
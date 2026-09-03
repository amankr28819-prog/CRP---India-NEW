const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET || 'crp_india_super_secret_jwt_key_2026_dev_secure',
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

    const cleanVoterId = voterId.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(cleanVoterId)) {
      return res.status(400).json({
        success: false,
        message: 'Voter ID must be a 10-digit alphanumeric code (e.g. ABC1234567).'
      });
    }

    if (agreedToTerms !== true && agreedToTerms !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the Terms & Conditions and Privacy Policy to create an account.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
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
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
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
        name: user.name,
        email: user.email,
        phone: user.phone,
        voterId: user.voterId,
        role: user.role
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

    // Citizen login requires a 10-digit alphanumeric Voter ID
    if (expectedRole === 'citizen') {
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
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
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
        name: user.name,
        email: user.email,
        phone: user.phone,
        voterId: user.voterId || '',
        role: user.role,
        department: user.department,
        designation: user.designation
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

module.exports = {
  register,
  login,
  getMe
};
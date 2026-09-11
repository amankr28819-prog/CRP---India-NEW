const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { getUploadedFileUrl } = require('../middleware/upload');

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
      assignedCategory: user.assignedCategory || '',
      email: user.email,
      name: user.name
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to validate and normalize mobile numbers
const validateAndNormalizePhone = (phoneInput) => {
  if (!phoneInput || typeof phoneInput !== 'string' || !phoneInput.trim()) {
    return { valid: false, error: 'Mobile number is required for citizen registration.' };
  }
  const trimmed = phoneInput.trim();
  let digits = trimmed;
  if (digits.startsWith('+91')) {
    digits = digits.slice(3).trim();
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2).trim();
  }

  if (!/^\d+$/.test(digits)) {
    return { valid: false, error: 'Mobile number must contain only numeric digits (no alphabetic or special characters).' };
  }
  if (digits.length !== 10) {
    return { valid: false, error: 'Mobile number must be exactly 10 digits.' };
  }
  const firstDigit = digits[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return { valid: false, error: 'Mobile number must begin with 6, 7, 8, or 9.' };
  }
  return { valid: true, digits, normalized: `+91${digits}` };
};

// @desc Register citizen
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, voterId, agreedToTerms } = req.body;

    if (!name || !email || !password || !voterId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, valid email, mobile number, password, and Voter ID.'
      });
    }

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof voterId !== 'string' ||
      typeof phone !== 'string'
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

    if (!cleanEmail.endsWith('.com') && !cleanEmail.endsWith('.in')) {
      return res.status(400).json({
        success: false,
        message: 'Email must end with .com or .in.'
      });
    }

    // Validate mobile number
    const phoneCheck = validateAndNormalizePhone(phone);
    if (!phoneCheck.valid) {
      return res.status(400).json({
        success: false,
        message: phoneCheck.error
      });
    }
    const normalizedPhone = phoneCheck.normalized;

    // Validate confirm password if provided
    if (confirmPassword !== undefined && confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 128 characters long.'
      });
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpper || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.'
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

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check unique mobile number across all accounts
    const existingPhone = await User.findOne({
      phone: { $in: [normalizedPhone, phoneCheck.digits] }
    });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered.'
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
      phone: normalizedPhone,
      voterId: cleanVoterId,
      constituency: (typeof req.body.constituency === 'string' && req.body.constituency.trim()) ? req.body.constituency.trim() : 'Central Parliamentary Constituency',
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

// @desc Login user (citizen or authority) via Email or Mobile Number
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, identifier, password, expectedRole, voterId } = req.body;
    const loginIdentifier = (identifier || email || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your email address/mobile number and password.'
      });
    }

    if (typeof loginIdentifier !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Identifier and password must be valid text.'
      });
    }

    let query = {};
    if (loginIdentifier.includes('@')) {
      // Email authentication
      query = { email: loginIdentifier.toLowerCase() };
    } else {
      // Mobile number authentication: normalize to +91 representation while safely querying both formats
      let digits = loginIdentifier;
      if (digits.startsWith('+91')) {
        digits = digits.slice(3).trim();
      } else if (digits.startsWith('91') && digits.length === 12) {
        digits = digits.slice(2).trim();
      }

      if (/^[6-9]\d{9}$/.test(digits)) {
        const normalized = `+91${digits}`;
        query = { phone: { $in: [normalized, digits] } };
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please enter a valid email address or 10-digit mobile number.'
        });
      }
    }

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/mobile number and password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your password.'
      });
    }

    const authorityRoles = ['authority', 'authority_admin', 'authority_category'];

    // If logging in through authority portal, ensure the account has authority privileges
    if (expectedRole === 'authority' && !authorityRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: This account does not have Municipal Authority clearance.'
      });
    }

    // If logging in through citizen portal, ensure authority accounts use the authority portal
    if (expectedRole === 'citizen' && user.role !== 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: Authority accounts must sign in through the Municipal Authority Portal.'
      });
    }

    const token = generateToken(user);
    const isAuthUser = authorityRoles.includes(user.role);
    const clientRole = isAuthUser ? 'authority' : user.role;

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: formatUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get current logged-in user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  const authorityRoles = ['authority', 'authority_admin', 'authority_category'];
  const isAuthUser = req.user && authorityRoles.includes(req.user.role);

  // Auto-clear expired suspension
  if (req.user && req.user.isSuspended && req.user.suspendedUntil && new Date(req.user.suspendedUntil) <= new Date()) {
    req.user.isSuspended = false;
    req.user.suspendedUntil = null;
    await req.user.save();
  }

  const userObj = req.user && (req.user.toObject ? req.user.toObject() : { ...req.user });

  // Check if citizen has an existing local password
  let hasPassword = true;
  if (req.user && req.user.role === 'citizen') {
    const userWithPass = await User.findById(req.user._id).select('+password');
    hasPassword = Boolean(userWithPass && userWithPass.password);
  }

  res.json({
    success: true,
    user: {
      ...userObj,
      role: isAuthUser ? 'authority' : (req.user ? req.user.role : 'citizen'),
      authorityRole: req.user ? req.user.role : 'citizen',
      assignedCategory: (req.user && req.user.assignedCategory) || '',
      constituency: (req.user && req.user.constituency) || 'Central Parliamentary Constituency',
      karma: (req.user && req.user.karma) || 0,
      warningCount: (req.user && req.user.warningCount) || 0,
      suspensionCount: (req.user && req.user.suspensionCount) || 0,
      isSuspended: (req.user && req.user.isSuspended) || false,
      suspendedUntil: (req.user && req.user.suspendedUntil) || null,
      authProvider: (req.user && req.user.authProvider) || 'local',
      googleId: (req.user && req.user.googleId) || undefined,
      isGoogleLinked: Boolean(req.user && req.user.googleId),
      hasPassword
    }
  });
};

// Helper to construct uniform user responses across auth endpoints
const formatUserResponse = (user) => {
  const authorityRoles = ['authority', 'authority_admin', 'authority_category'];
  const isAuthUser = user && authorityRoles.includes(user.role);
  const clientRole = isAuthUser ? 'authority' : (user ? user.role : 'citizen');

  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    voterId: user.voterId || '',
    role: clientRole,
    authorityRole: user.role,
    assignedCategory: user.assignedCategory || '',
    department: user.department || '',
    designation: user.designation || '',
    avatar: user.avatar || '',
    constituency: user.constituency || 'Central Parliamentary Constituency',
    karma: user.karma || 0,
    warningCount: user.warningCount || 0,
    suspensionCount: user.suspensionCount || 0,
    isSuspended: user.isSuspended || false,
    suspendedUntil: user.suspendedUntil || null,
    settings: user.settings,
    createdAt: user.createdAt,
    authProvider: user.authProvider || 'local',
    googleId: user.googleId || undefined,
    isGoogleLinked: Boolean(user.googleId),
    hasPassword: Boolean(user.password)
  };
};

// @desc Update user profile details (e.g. name or phone)
// @route PATCH /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, constituency } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // Change 14: Citizen official name and constituency are permanently anchored to verified Voter ID
    if (user.role === 'citizen') {
      if (name && name.trim() !== user.name) {
        return res.status(403).json({
          success: false,
          message: 'Official name is permanently anchored to your verified Voter ID and cannot be modified.'
        });
      }
      if (constituency && constituency.trim() !== user.constituency) {
        return res.status(403).json({
          success: false,
          message: 'Constituency is permanently anchored to your verified Voter ID and cannot be modified.'
        });
      }
      if (req.body.voterId && req.body.voterId.trim().toUpperCase() !== user.voterId) {
        return res.status(403).json({
          success: false,
          message: 'Voter ID is permanent and cannot be modified.'
        });
      }
    } else {
      if (name && typeof name === 'string' && name.trim()) {
        const cleanName = name.trim();
        if (cleanName.length < 2 || cleanName.length > 100) {
          return res.status(400).json({
            success: false,
            message: 'Name must be between 2 and 100 characters in length.'
          });
        }
        user.name = cleanName;
      }
    }

    if (phone !== undefined && typeof phone === 'string') {
      user.phone = phone.trim();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: formatUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

// @desc Upload or change profile picture
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

    user.avatar = getUploadedFileUrl(req.file);
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo updated successfully.',
      avatar: user.avatar,
      user: formatUserResponse(user)
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
      user: formatUserResponse(user)
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

// @desc Change or set user password
// @route PATCH /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      !newPassword ||
      typeof newPassword !== 'string' ||
      (confirmPassword && typeof confirmPassword !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid new password.'
      });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'New password must be between 8 and 128 characters long.'
      });
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // If user already has an established local password, verify current password
    if (user.password) {
      if (!currentPassword || typeof currentPassword !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change your password.'
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password cannot be identical to current password.'
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password does not match registered account password.'
        });
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password saved successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Verify Citizen Password Reset Credentials (Email + Mobile + Voter ID)
// @route POST /api/auth/reset-password/verify
const verifyCitizenReset = async (req, res, next) => {
  try {
    const { email, phone, voterId } = req.body;

    if (!email || !phone || !voterId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Email, Mobile Number, and Voter ID.'
      });
    }

    if (
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof voterId !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'All verification fields must be valid text.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanVoterId = voterId.trim().toUpperCase();

    // Normalize phone input
    let digits = phone.trim();
    if (digits.startsWith('+91')) {
      digits = digits.slice(3).trim();
    } else if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.slice(2).trim();
    }

    if (!/^[6-9]\d{9}$/.test(digits)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.'
      });
    }

    const normalizedPhone = `+91${digits}`;

    // Verify all 3 pieces belong to the SAME citizen account
    const user = await User.findOne({
      role: 'citizen',
      email: cleanEmail,
      voterId: cleanVoterId,
      phone: { $in: [normalizedPhone, digits] }
    });

    if (!user) {
      // Safe generic message to avoid enumeration
      return res.status(400).json({
        success: false,
        message: 'Verification failed. No matching citizen account found for the provided Email, Mobile Number, and Voter ID.'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'This citizen account is suspended. Password reset is not permitted.'
      });
    }

    // Generate single-use signed reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { id: user._id, type: 'citizen_password_reset' },
      getJwtSecret(),
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'Citizen identity verified successfully.',
      resetToken
    });
  } catch (err) {
    next(err);
  }
};

// @desc Confirm Citizen Password Reset with verified token
// @route POST /api/auth/reset-password/confirm
const confirmCitizenPasswordReset = async (req, res, next) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset authorization token and new password are required.'
      });
    }

    if (typeof resetToken !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Form inputs must be valid text.'
      });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 128 characters long.'
      });
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, getJwtSecret());
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        message: 'Password reset session has expired or is invalid. Please start the verification process again.'
      });
    }

    if (!decoded || decoded.type !== 'citizen_password_reset' || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid reset authorization.'
      });
    }

    const user = await User.findById(decoded.id).select('+password');
    if (!user || user.role !== 'citizen') {
      return res.status(404).json({
        success: false,
        message: 'Citizen account not found.'
      });
    }

    // Set new password (pre-save hook hashes with bcrypt 10 rounds)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
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

// ==========================================
// GOOGLE AUTHENTICATION FOR CITIZENS ONLY
// ==========================================

let googleOAuthClient = null;
const getGoogleClient = () => {
  if (!googleOAuthClient) {
    googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || undefined);
  }
  return googleOAuthClient;
};

/**
 * Verify Google ID token cryptographically.
 * Validates: signature, audience (if configured), issuer, expiration, email_verified, and extracts sub, email, name, picture.
 */
const verifyGoogleToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Google credential token is required.');
  }
  if (idToken.trim().length < 10) {
    throw new Error('Malformed Google credential token.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || undefined;
  const client = getGoogleClient();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google token payload.');
  }

  // Verify issuer
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    throw new Error('Invalid Google token issuer.');
  }

  // Verify expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Google token has expired. Please authenticate again.');
  }

  // Verify email_verified
  if (!payload.email_verified) {
    throw new Error('Google email address is not verified by Google.');
  }

  if (!payload.sub) {
    throw new Error('Google token missing unique subject identifier.');
  }

  return {
    sub: payload.sub,
    email: (payload.email || '').toLowerCase().trim(),
    name: (payload.name || '').trim(),
    picture: payload.picture || ''
  };
};

let customGoogleVerifier = null;
const _setGoogleTokenVerifierForTesting = (verifierFn) => {
  customGoogleVerifier = verifierFn;
};

// @desc Get public Google Client ID configuration for frontend
// @route GET /api/auth/google/config
const getGoogleConfig = (req, res) => {
  res.json({
    success: true,
    clientId: process.env.GOOGLE_CLIENT_ID || ''
  });
};

// @desc Google Sign-In for Citizens
// @route POST /api/auth/google
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Google credential token is required.'
      });
    }

    let tokenPayload;
    try {
      tokenPayload = await (customGoogleVerifier || verifyGoogleToken)(credential);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        message: tokenErr.message || 'Google token verification failed.'
      });
    }

    const { sub, email, name, picture } = tokenPayload;

    // 1. Check if a citizen account is already linked with this verified Google sub
    const userWithGoogleId = await User.findOne({ googleId: sub }).select('+password');
    if (userWithGoogleId) {
      if (userWithGoogleId.role !== 'citizen') {
        return res.status(403).json({
          success: false,
          message: 'Google Sign-In is only permitted for citizen accounts.'
        });
      }

      // Check suspension
      if (userWithGoogleId.isSuspended) {
        if (userWithGoogleId.suspendedUntil && new Date(userWithGoogleId.suspendedUntil) > new Date()) {
          return res.status(403).json({
            success: false,
            message: `Account is suspended until ${new Date(userWithGoogleId.suspendedUntil).toLocaleDateString()}. Reason: ${userWithGoogleId.suspensionHistory?.[userWithGoogleId.suspensionHistory.length - 1]?.reason || 'Administrative Action'}`
          });
        }
        userWithGoogleId.isSuspended = false;
        userWithGoogleId.suspendedUntil = null;
        await userWithGoogleId.save();
      }

      const token = generateToken(userWithGoogleId);
      console.log(`[AUTH] Google Sign-In success for citizen ID: ${userWithGoogleId._id}`);
      return res.json({
        success: true,
        token,
        user: formatUserResponse(userWithGoogleId),
        message: 'Signed in successfully with Google.'
      });
    }

    // 2. Check if an existing citizen account exists with the verified Google email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      if (existingUserByEmail.role !== 'citizen') {
        return res.status(403).json({
          success: false,
          message: 'Google Sign-In is only permitted for citizen accounts.'
        });
      }

      // Check collision
      if (existingUserByEmail.googleId && existingUserByEmail.googleId !== sub) {
        return res.status(400).json({
          success: false,
          message: 'This CRP citizen account is already linked to a different Google account.'
        });
      }

      // Prompt for password verification to link existing account
      return res.json({
        success: true,
        requiresLinking: true,
        email: existingUserByEmail.email,
        name: existingUserByEmail.name,
        message: 'An existing CRP account was found with this email. Please verify your password to link your Google account.'
      });
    }

    // 3. New Google User - Verify email domain (.com or .in)
    if (!email.endsWith('.com') && !email.endsWith('.in')) {
      return res.status(400).json({
        success: false,
        message: 'Only email addresses ending with .com or .in are permitted for citizen registration.'
      });
    }

    // Return onboarding requirement with verified Google details
    return res.json({
      success: true,
      requiresOnboarding: true,
      email,
      name,
      picture,
      message: 'Please complete citizen registration with your Voter ID and Mobile Number.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Verify password and link Google sub to existing citizen account
// @route POST /api/auth/google/link
const googleLink = async (req, res, next) => {
  try {
    const { credential, password } = req.body;
    if (!credential || typeof credential !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Google credential token and current password are required.'
      });
    }

    let tokenPayload;
    try {
      tokenPayload = await (customGoogleVerifier || verifyGoogleToken)(credential);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        message: tokenErr.message || 'Google token verification failed.'
      });
    }

    const { sub, email, picture } = tokenPayload;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Citizen account not found.'
      });
    }

    if (user.role !== 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Google Sign-In is only permitted for citizen accounts.'
      });
    }

    // Collision checks
    if (user.googleId && user.googleId !== sub) {
      return res.status(400).json({
        success: false,
        message: 'This CRP account is already linked to a different Google account.'
      });
    }

    const otherUserWithGoogleId = await User.findOne({ googleId: sub });
    if (otherUserWithGoogleId && String(otherUserWithGoogleId._id) !== String(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'This Google account is already linked to another CRP citizen.'
      });
    }

    // Verify existing password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Account verification failed.'
      });
    }

    // Link Google sub to SAME User._id without migrating/copying data
    user.googleId = sub;
    if (!user.avatar && picture) {
      user.avatar = picture;
    }
    await user.save();

    // Check suspension
    if (user.isSuspended) {
      if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
        return res.status(403).json({
          success: false,
          message: `Account is suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}. Reason: ${user.suspensionHistory?.[user.suspensionHistory.length - 1]?.reason || 'Administrative Action'}`
        });
      }
      user.isSuspended = false;
      user.suspendedUntil = null;
      await user.save();
    }

    const token = generateToken(user);
    console.log(`[AUTH] Google linked successfully for citizen ID: ${user._id}`);
    return res.json({
      success: true,
      token,
      user: formatUserResponse(user),
      message: 'Google account linked successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Complete onboarding for new Google-authenticated citizen
// @route POST /api/auth/google/onboard
const googleOnboard = async (req, res, next) => {
  try {
    const { credential, voterId, phone, name } = req.body;
    if (!credential || typeof credential !== 'string' || !voterId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Google credential, Voter ID, and mobile number are required.'
      });
    }

    let tokenPayload;
    try {
      tokenPayload = await (customGoogleVerifier || verifyGoogleToken)(credential);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        message: tokenErr.message || 'Google token verification failed.'
      });
    }

    const { sub, email, picture } = tokenPayload;

    // Enforce .com or .in domain on new Google registrations
    if (!email.endsWith('.com') && !email.endsWith('.in')) {
      return res.status(400).json({
        success: false,
        message: 'Only email addresses ending with .com or .in are permitted for citizen registration.'
      });
    }

    // Collision checks
    const existingGoogle = await User.findOne({ googleId: sub });
    if (existingGoogle) {
      return res.status(400).json({
        success: false,
        message: 'This Google account is already registered. Please sign in.'
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please verify your password to link your account.'
      });
    }

    // Validate Voter ID
    const cleanVoterId = typeof voterId === 'string' ? voterId.trim().toUpperCase() : '';
    if (!/^[A-Z0-9]{10}$/.test(cleanVoterId)) {
      return res.status(400).json({
        success: false,
        message: 'Voter ID must be a 10-digit alphanumeric code (e.g. ABC1234567).'
      });
    }

    // Validate Mobile
    const phoneCheck = validateAndNormalizePhone(phone);
    if (!phoneCheck.valid) {
      return res.status(400).json({
        success: false,
        message: phoneCheck.error
      });
    }
    const normalizedPhone = phoneCheck.normalized;

    // Check Voter ID uniqueness
    const existingVoter = await User.findOne({ voterId: cleanVoterId });
    if (existingVoter) {
      return res.status(400).json({
        success: false,
        message: 'This Voter ID is already associated with an existing account.'
      });
    }

    // Check Phone uniqueness
    const existingPhone = await User.findOne({
      phone: { $in: [normalizedPhone, phoneCheck.digits] }
    });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered.'
      });
    }

    const citizenName = (name && typeof name === 'string' && name.trim()) || tokenPayload.name || 'Citizen';
    if (citizenName.length < 2 || citizenName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be between 2 and 100 characters in length.'
      });
    }

    // Create exactly ONE User document
    const newUser = new User({
      name: citizenName,
      email,
      googleId: sub,
      authProvider: 'google',
      phone: normalizedPhone,
      voterId: cleanVoterId,
      role: 'citizen',
      avatar: picture || '',
      agreedToTerms: true
    });

    await newUser.save();

    const token = generateToken(newUser);
    console.log(`[AUTH] New citizen registered and linked via Google. ID: ${newUser._id}`);
    return res.status(201).json({
      success: true,
      token,
      user: formatUserResponse(newUser),
      message: 'Citizen account created and linked with Google successfully.'
    });
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.voterId) {
        return res.status(400).json({
          success: false,
          message: 'This Voter ID is already associated with an existing account.'
        });
      }
      if (err.keyPattern?.phone) {
        return res.status(400).json({
          success: false,
          message: 'This mobile number is already registered.'
        });
      }
      if (err.keyPattern?.googleId) {
        return res.status(400).json({
          success: false,
          message: 'This Google account is already registered.'
        });
      }
      if (err.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }
    }
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
  verifyCitizenReset,
  confirmCitizenPasswordReset,
  updateSettings,
  getGoogleConfig,
  googleAuth,
  googleLink,
  googleOnboard,
  validateAndNormalizePhone,
  _setGoogleTokenVerifierForTesting
};
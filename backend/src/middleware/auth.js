const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

const verifyToken = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required. Please sign in.'
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or session expired.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please sign in again.'
    });
  }
};

const isAuthority = (req, res, next) => {
  const authorityRoles = ['authority', 'authority_admin', 'authority_category'];
  if (!req.user || !authorityRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Municipal Authority privilege required.'
    });
  }
  next();
};

const isCitizen = (req, res, next) => {
  if (!req.user || req.user.role !== 'citizen') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Citizen role required. Municipal Authorities cannot perform this action.'
    });
  }
  next();
};

const checkSuspension = (req, res, next) => {
  if (req.user && req.user.isSuspended) {
    if (req.user.suspendedUntil && new Date(req.user.suspendedUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: `Your account is suspended until ${new Date(req.user.suspendedUntil).toLocaleDateString()} due to receiving 3 warnings. You cannot perform this action while suspended.`
      });
    } else {
      req.user.isSuspended = false;
      req.user.suspendedUntil = null;
      req.user.save().catch(err => console.error('[AUTH] Failed to clear expired suspension:', err));
    }
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};

module.exports = { verifyToken, isAuthority, isCitizen, checkSuspension, optionalAuth };
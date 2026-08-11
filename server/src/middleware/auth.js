// auth.js - Express JWT Authentication & Role-Based Access Middleware
const jwt = require('jsonwebtoken');
const db = require('../data/dbStore');

const JWT_SECRET = process.env.JWT_SECRET || 'veritus_super_secret_jwt_key_2026';

// Verify token from Authorization header (Bearer <token>)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.users.find(u => u.id === decoded.id || u.email === decoded.email);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired authentication token' });
  }
};

// Optional auth for public routes that enhance response if logged in
const optionalToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.users.find(u => u.id === decoded.id || u.email === decoded.email);
      if (user) req.user = user;
    } catch (e) {
      // Ignore token error for optional auth
    }
  }
  next();
};

// Require Admin Role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Administrator privilege required' });
  }
  next();
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalToken,
  requireAdmin
};

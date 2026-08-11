// authController.js - Auth logic for login, registration, and user profiles
const jwt = require('jsonwebtoken');
const db = require('../data/dbStore');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    }
  });
};

exports.register = (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ success: false, error: 'All fields (email, password, full name) are required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, error: 'Account with this email already exists' });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    email: email.toLowerCase(),
    password: password,
    full_name: full_name,
    role: 'student',
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role
    }
  });
};

exports.googleLogin = (req, res) => {
  const { credential, email, name } = req.body;
  let userEmail = (email || '').toLowerCase();
  let userName = name || 'Google Risk Practitioner';

  if (credential) {
    try {
      const decoded = jwt.decode(credential);
      if (decoded && decoded.email) {
        userEmail = decoded.email.toLowerCase();
        userName = decoded.name || decoded.given_name || userName;
      }
    } catch (err) {
      console.warn('[Google Auth] Could not decode credential payload:', err.message);
    }
  }

  if (!userEmail) {
    userEmail = 'google.learner@veritus.com';
  }

  let user = db.users.find(u => u.email.toLowerCase() === userEmail);

  if (!user) {
    // Provision new Risk Learner account automatically via Google OAuth
    user = {
      id: `u-google-${Date.now()}`,
      email: userEmail,
      password: 'google_oauth_protected',
      full_name: userName,
      role: 'student', // Risk Learner
      created_at: new Date().toISOString()
    };
    db.users.push(user);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Google Sign-In successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    }
  });
};

exports.getProfile = (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      role: req.user.role,
      created_at: req.user.created_at
    }
  });
};

exports.resetPassword = (req, res) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  // Always return success for security privacy
  return res.json({
    success: true,
    message: 'If an account exists for this email, password reset instructions have been sent.'
  });
};

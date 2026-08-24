// auth.js - Express Middleware for Supabase Auth
const supabase = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      req.user = profile;
    } else {
      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        role: 'student'
      };
    }
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

// Optional auth for public routes that enhance response if logged in
const optionalToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profile) {
          req.user = profile;
        } else {
          req.user = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name,
            role: 'student'
          };
        }
      }
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
  authenticateToken,
  optionalToken,
  requireAdmin
};

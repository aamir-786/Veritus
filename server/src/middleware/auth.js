// auth.js - Express Middleware for Supabase Auth
const supabase = require('../config/supabase');

// Verify token from Authorization header (Bearer <token>) or query string
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
    // Verify the JWT with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
    }

    // Fetch the user's role and profile data from our public.profiles table
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Auto-create profile if missing (e.g. users created before the database trigger)
    if (!profile) {
      const newProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: 'student'
      };
      
      const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select('*')
        .single();
        
      if (!insertError && insertedProfile) {
        profile = insertedProfile;
      } else {
        // Fallback to basic user info if insert fails
        profile = newProfile;
      }
    }

    // Attach to request
    req.user = profile;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication' });
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

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') }); // For root env
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // For server env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

// Service role client bypasses RLS and can be safely used in backend logic
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;

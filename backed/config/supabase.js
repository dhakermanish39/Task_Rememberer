const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };

// Main admin client (service_role): database queries + Supabase Auth admin calls.
// Keep the service_role key on the backend only, never in the frontend.
const supabase = createClient(url, key, options);

// Fresh isolated client for signInWithPassword, so a user's session never
// replaces the admin credentials of the shared client above.
supabase.newClient = () => createClient(url, key, options);

module.exports = supabase;

import { createClient } from '@supabase/supabase-js';

// Client-side client (using anon key) - for browser
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper to format database errors
export const formatSupabaseError = (error) => {
  if (!error) return 'An unknown error occurred';

  const errorMap = {
    '23505': 'This record already exists',
    '23503': 'Referenced record not found',
    'duplicate': 'Duplicate entry detected',
  };

  return errorMap[error.code] || error.message || 'Database error';
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('CRITICAL: Supabase credentials missing in .env! Victor prohibits hardcoded keys for production safety.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

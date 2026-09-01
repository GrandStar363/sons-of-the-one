import { createClient } from '@supabase/supabase-js';

// Credentials injected at build time from .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };

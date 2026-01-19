import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { env } from '../config/env';

export const supabase = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

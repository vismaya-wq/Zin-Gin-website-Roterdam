import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './env';

let client: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }
  if (!client) {
    client = createBrowserClient(supabaseUrl(), supabaseAnonKey());
  }
  return client;
}

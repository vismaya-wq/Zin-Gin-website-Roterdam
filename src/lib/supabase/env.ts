export function supabaseUrl() {
  return (
    import.meta.env.SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL ||
    (typeof process !== 'undefined' ? process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL : '') ||
    ''
  ).trim();
}

export function supabaseAnonKey() {
  return (
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined'
      ? process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY
      : '') ||
    ''
  ).trim();
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function supabaseConfigError() {
  return 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY (see .env.example).';
}

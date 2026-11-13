import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './env';

type CookieStore = {
  getAll(): { name: string; value: string }[];
  set(name: string, value: string, options?: Record<string, unknown>): void;
};

export function cookieStoreFromAstro(cookies: AstroCookies, request: Request): CookieStore {
  return {
    getAll() {
      if (typeof (cookies as { getAll?: () => { name: string; value: string }[] }).getAll === 'function') {
        return cookies.getAll().map((row) => ({ name: row.name, value: row.value }));
      }
      const header = request.headers.get('cookie') ?? '';
      return parseCookieHeader(header).map((c) => ({ name: c.name, value: c.value ?? '' }));
    },
    set(name, value, options) {
      cookies.set(name, value, options as Parameters<AstroCookies['set']>[2]);
    },
  };
}

export function cookieStoreFromRequest(request: Request, setCookie: (name: string, value: string, options: Record<string, unknown>) => void): CookieStore {
  const header = request.headers.get('cookie') ?? '';
  const parsed = parseCookieHeader(header).map((c) => ({ name: c.name, value: c.value ?? '' }));
  return {
    getAll: () => parsed,
    set(name, value, options) {
      setCookie(name, value, options ?? {});
    },
  };
}

export function createSupabaseServerClient(store: CookieStore): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
      },
    },
  });
}

export async function getStaffSession(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.active) return null;
  if (profile.role !== 'owner' && profile.role !== 'manager' && profile.role !== 'worker') return null;

  return {
    sub: profile.id,
    email: profile.email,
    name: profile.full_name || profile.email,
    role: profile.role as 'owner' | 'manager' | 'worker',
  };
}

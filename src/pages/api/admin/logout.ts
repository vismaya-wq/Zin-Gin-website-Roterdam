export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { cookieStoreFromAstro, createSupabaseServerClient } from '../../../lib/supabase/server';
import { clearCookie } from '../../../server/auth';
import { json } from '../../../server/http';

export const POST: APIRoute = async ({ cookies, request }) => {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient(cookieStoreFromAstro(cookies, request));
    await supabase.auth.signOut();
    return json({ ok: true });
  }
  return json({ ok: true }, 200, { 'set-cookie': clearCookie() });
};

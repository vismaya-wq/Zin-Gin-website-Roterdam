export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { cookieStoreFromAstro, createSupabaseServerClient, getStaffSession } from '../../../lib/supabase/server';
import { createToken, sessionCookie } from '../../../server/auth';
import { findUserByEmail, verifyPassword } from '../../../server/db';
import { json } from '../../../server/http';

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Sign in with email and password.' }, 400);
  }
  const email = (body.email || '').trim();
  const password = body.password || '';

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient(cookieStoreFromAstro(cookies, request));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return json({ error: 'Those details do not match a staff account.' }, 401);
    const session = await getStaffSession(supabase);
    if (!session) {
      await supabase.auth.signOut();
      return json({ error: 'This account is not authorised for the admin desk.' }, 403);
    }
    return json({ ok: true, role: session.role, name: session.name });
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return json({ error: 'Those details do not match a staff account.' }, 401);
  }
  const token = createToken({ sub: user.id, role: user.role, name: user.name });
  return json({ ok: true, role: user.role, name: user.name }, 200, { 'set-cookie': sessionCookie(token) });
};

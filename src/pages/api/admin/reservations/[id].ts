export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../../lib/supabase/env';
import { actOnReservation } from '../../../../server/db';
import { sbActOnReservation } from '../../../../server/supabase-cms';
import { guardStaff } from '../../../../server/staff-auth';
import { json } from '../../../../server/http';

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const auth = await guardStaff(cookies, request, 'manager');
  if ('error' in auth) return auth.error;

  let body: { action?: string; time?: string; seating?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Missing action.' }, 400);
  }

  if (isSupabaseConfigured() && auth.supabase) {
    const result = await sbActOnReservation(auth.supabase, params.id || '', auth.session.sub, body.action || '', body);
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json({ ok: true });
  }

  const result = await actOnReservation(
    params.id || '',
    { id: auth.session.sub, name: auth.session.name },
    body.action || '',
    body,
  );
  if ('error' in result && result.error) return json({ error: result.error }, 400);
  return json({ ok: true });
};

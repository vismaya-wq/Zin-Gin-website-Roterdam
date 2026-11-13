export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../../lib/supabase/env';
import { deleteEvent, saveEvent } from '../../../../server/db';
import { sbDeleteEvent, sbSaveEvent } from '../../../../server/supabase-cms';
import { guardStaff } from '../../../../server/staff-auth';
import { json } from '../../../../server/http';

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Missing update.' }, 400);
  }

  const id = params.id || '';

  if (isSupabaseConfigured() && auth.supabase) {
    const result = await sbSaveEvent(auth.supabase, body as never, id);
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json({ ok: true });
  }

  const result = await saveEvent(body as never, id);
  if ('error' in result && result.error) return json({ error: result.error }, 400);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  const id = params.id || '';

  if (isSupabaseConfigured() && auth.supabase) {
    const result = await sbDeleteEvent(auth.supabase, id);
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json({ ok: true });
  }

  const result = await deleteEvent(id);
  if ('error' in result && result.error) return json({ error: result.error }, 400);
  return json({ ok: true });
};

export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../../lib/supabase/env';
import { deleteMenuItem, reorderMenuItem, saveMenuItem } from '../../../../server/db';
import { sbDeleteMenuItem, sbReorderMenuItem, sbSaveMenuItem } from '../../../../server/supabase-cms';
import { guardStaff } from '../../../../server/staff-auth';
import { json } from '../../../../server/http';

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  let body: { direction?: 'up' | 'down'; action?: string } & Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Missing update.' }, 400);
  }

  const id = params.id || '';

  if (isSupabaseConfigured() && auth.supabase) {
    if (body.action === 'reorder') {
      const result = await sbReorderMenuItem(auth.supabase, id, body.direction === 'down' ? 'down' : 'up');
      if ('error' in result && result.error) return json({ error: result.error }, 400);
      return json({ ok: true });
    }
    const result = await sbSaveMenuItem(auth.supabase, body as never, id);
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json({ ok: true });
  }

  if (body.action === 'reorder') {
    const result = await reorderMenuItem(id, body.direction === 'down' ? 'down' : 'up');
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json({ ok: true });
  }
  const result = await saveMenuItem(body as never, id);
  if ('error' in result && result.error) return json({ error: result.error }, 400);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  const id = params.id || '';

  if (isSupabaseConfigured() && auth.supabase) {
    const result = await sbDeleteMenuItem(auth.supabase, id);
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json({ ok: true });
  }

  const result = await deleteMenuItem(id);
  if ('error' in result && result.error) return json({ error: result.error }, 400);
  return json({ ok: true });
};

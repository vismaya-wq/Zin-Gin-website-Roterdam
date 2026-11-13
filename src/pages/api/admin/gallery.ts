export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { getGalleryRecords, saveGalleryItem } from '../../../server/db';
import { sbGetGalleryRecords, sbSaveGalleryItem } from '../../../server/supabase-cms';
import { guardStaff } from '../../../server/staff-auth';
import { json } from '../../../server/http';

export const GET: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  if (isSupabaseConfigured() && auth.supabase) {
    try {
      return json({ items: await sbGetGalleryRecords(auth.supabase, true) });
    } catch {
      return json({ error: 'Could not load gallery.' }, 503);
    }
  }
  return json({ items: getGalleryRecords() });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Missing image.' }, 400);
  }

  if (isSupabaseConfigured() && auth.supabase) {
    const result = await sbSaveGalleryItem(auth.supabase, body as never);
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json(result);
  }

  const result = await saveGalleryItem(body as never);
  if ('error' in result && result.error) return json({ error: result.error }, 400);
  return json(result);
};

export const prerender = false;

import type { APIRoute } from 'astro';
import { createSupabaseAnonClient } from '../../lib/supabase/anon';
import { isSupabaseConfigured } from '../../lib/supabase/env';
import { getGalleryRecords } from '../../server/db';
import { sbGetGalleryRecords } from '../../server/supabase-cms';
import { json } from '../../server/http';

export const GET: APIRoute = async () => {
  if (isSupabaseConfigured()) {
    try {
      const items = await sbGetGalleryRecords(createSupabaseAnonClient());
      return json({ items });
    } catch {
      return json({ error: 'Gallery is temporarily unavailable.' }, 503);
    }
  }
  return json({ items: getGalleryRecords() });
};

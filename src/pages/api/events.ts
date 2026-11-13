export const prerender = false;

import type { APIRoute } from 'astro';
import { createSupabaseAnonClient } from '../../lib/supabase/anon';
import { isSupabaseConfigured } from '../../lib/supabase/env';
import { listEvents } from '../../server/db';
import { sbListEvents } from '../../server/supabase-cms';
import { json } from '../../server/http';

export const GET: APIRoute = async () => {
  if (isSupabaseConfigured()) {
    try {
      const events = await sbListEvents(createSupabaseAnonClient(), false);
      return json({ events });
    } catch {
      return json({ error: 'Events are temporarily unavailable.' }, 503);
    }
  }
  return json({ events: listEvents(false) });
};

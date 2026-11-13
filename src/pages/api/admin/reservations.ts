export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { listReservations } from '../../../server/db';
import { sbListReservations } from '../../../server/supabase-cms';
import { guardStaff } from '../../../server/staff-auth';
import { json } from '../../../server/http';

export const GET: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'worker');
  if ('error' in auth) return auth.error;

  if (isSupabaseConfigured() && auth.supabase) {
    try {
      const reservations = await sbListReservations(auth.supabase);
      return json({ reservations });
    } catch {
      return json({ error: 'Could not load reservations.' }, 503);
    }
  }

  return json({ reservations: listReservations() });
};

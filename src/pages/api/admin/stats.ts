export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { createSupabaseAnonClient } from '../../../lib/supabase/anon';
import { listReservations } from '../../../server/db';
import { sbDashboardStats } from '../../../server/supabase-cms';
import { guardStaff } from '../../../server/staff-auth';
import { json } from '../../../server/http';

export const GET: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'worker');
  if ('error' in auth) return auth.error;

  if (isSupabaseConfigured() && auth.supabase) {
    try {
      const stats = await sbDashboardStats(auth.supabase);
      return json({ stats });
    } catch {
      return json({ error: 'Could not load dashboard.' }, 503);
    }
  }

  const reservations = listReservations();
  const today = new Date().toISOString().slice(0, 10);
  return json({
    stats: {
      pendingToday: reservations.filter((r) => r.status === 'pending' && r.date === today).length,
      upcomingReservations: reservations.filter((r) => r.date >= today && (r.status === 'pending' || r.status === 'confirmed')).length,
      menuVisible: 0,
      galleryVisible: 0,
      upcomingEvents: 0,
    },
  });
};

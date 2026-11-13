export const prerender = false;

import type { APIRoute } from 'astro';
import { createSupabaseAnonClient } from '../../lib/supabase/anon';
import { isSupabaseConfigured } from '../../lib/supabase/env';
import { allowReservation, createReservation } from '../../server/db';
import { sbCreateReservation } from '../../server/supabase-cms';
import { json } from '../../server/http';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!allowReservation(clientAddress || 'local')) {
    return json({ error: 'Too many requests. Please call the restaurant.' }, 429);
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Send the booking as JSON.' }, 400);
  }

  const result = isSupabaseConfigured()
    ? await sbCreateReservation(createSupabaseAnonClient(), body)
    : await createReservation(body);

  if ('error' in result && result.error) return json({ error: result.error }, 400);
  const reservation = result.reservation;
  if (!reservation) return json({ ok: true });
  return json({
    ok: true,
    reservation: {
      id: reservation.id,
      name: reservation.name,
      guests: reservation.guests,
      date: reservation.date,
      time: reservation.time,
      seating: reservation.seating,
      roomNumber: reservation.roomNumber,
      status: reservation.status,
    },
  });
};

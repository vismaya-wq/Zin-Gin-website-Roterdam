export const prerender = false;

import type { APIRoute } from 'astro';
import { resolveStaffSession } from '../../../server/staff-auth';
import { json } from '../../../server/http';

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = await resolveStaffSession(cookies, request);
  if (!session) return json({ error: 'Sign in required.' }, 401);
  return json({ name: session.name, role: session.role });
};

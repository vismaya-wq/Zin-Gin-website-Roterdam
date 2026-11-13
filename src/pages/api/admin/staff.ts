export const prerender = false;

import type { APIRoute } from 'astro';
import { json } from '../../../server/http';

/** Team accounts are managed in Supabase Auth — not via the public API. */
export const GET: APIRoute = () => json({ error: 'Not available.' }, 404);
export const POST: APIRoute = () => json({ error: 'Not available.' }, 404);

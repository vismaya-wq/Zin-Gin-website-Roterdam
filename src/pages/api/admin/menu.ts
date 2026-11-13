export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { CATEGORIES } from '../../../data/menu';
import { getMenuRecords, saveMenuItem } from '../../../server/db';
import { sbGetAdminCategories, sbGetMenuRecords, sbSaveMenuItem } from '../../../server/supabase-cms';
import { guardStaff } from '../../../server/staff-auth';
import { json } from '../../../server/http';

export const GET: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  if (isSupabaseConfigured() && auth.supabase) {
    try {
      const [items, categories] = await Promise.all([sbGetMenuRecords(auth.supabase), sbGetAdminCategories(auth.supabase)]);
      return json({
        items,
        categories: categories.map((c) => ({ id: c.id, label: c.label })),
      });
    } catch {
      return json({ error: 'Could not load menu.' }, 503);
    }
  }

  return json({
    items: getMenuRecords(),
    categories: CATEGORIES.filter((category) => category.id !== 'popular'),
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Missing dish.' }, 400);
  }

  if (isSupabaseConfigured() && auth.supabase) {
    const result = await sbSaveMenuItem(auth.supabase, body as never);
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json(result);
  }

  const result = await saveMenuItem(body as never);
  if ('error' in result && result.error) return json({ error: result.error }, 400);
  return json(result);
};

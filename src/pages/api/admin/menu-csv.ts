export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { CATEGORIES } from '../../../data/menu';
import { deleteMenuItem, getMenuRecords, saveMenuItem } from '../../../server/db';
import { menuToCsv, parseMenuCsv, rowToMenuInput } from '../../../server/menu-csv';
import { sbDeleteMenuItem, sbGetAdminCategories, sbGetMenuRecords, sbSaveMenuItem } from '../../../server/supabase-cms';
import { guardStaff } from '../../../server/staff-auth';
import { json } from '../../../server/http';

async function loadMenu(auth: { supabase: Parameters<typeof sbGetMenuRecords>[0] | null }) {
  if (isSupabaseConfigured() && auth.supabase) {
    const [items, categories] = await Promise.all([sbGetMenuRecords(auth.supabase), sbGetAdminCategories(auth.supabase)]);
    return { items, categories: categories.map((category) => ({ id: category.id, label: category.label })) };
  }
  return {
    items: getMenuRecords(),
    categories: CATEGORIES.filter((category) => category.id !== 'popular').map((category) => ({ id: category.id, label: category.label })),
  };
}

export const GET: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;
  const { items } = await loadMenu(auth);
  return new Response(menuToCsv(items), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="zin-gin-menu.csv"',
      'cache-control': 'no-store',
    },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  let body: { csv?: string; confirm?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Upload a CSV file.' }, 400);
  }

  const { items, categories } = await loadMenu(auth);
  const parsed = parseMenuCsv(body.csv || '', items, categories);
  const summary = {
    add: parsed.rows.filter((row) => row.action === 'ADD').length,
    update: parsed.rows.filter((row) => row.action === 'UPDATE').length,
    delete: parsed.rows.filter((row) => row.action === 'DELETE').length,
  };

  if (!body.confirm || parsed.errors.length) {
    return json({ preview: true, summary, errors: parsed.errors, rows: parsed.rows });
  }

  for (const row of parsed.rows) {
    if (row.action === 'DELETE') {
      const result = isSupabaseConfigured() && auth.supabase ? await sbDeleteMenuItem(auth.supabase, row.id) : await deleteMenuItem(row.id);
      if ('error' in result && result.error) return json({ error: `Row ${row.line}: ${result.error}` }, 400);
      continue;
    }
    const input = rowToMenuInput(row);
    const result =
      isSupabaseConfigured() && auth.supabase
        ? await sbSaveMenuItem(auth.supabase, input, row.action === 'UPDATE' ? row.id : undefined)
        : await saveMenuItem(input, row.action === 'UPDATE' ? row.id : undefined);
    if ('error' in result && result.error) return json({ error: `Row ${row.line}: ${result.error}` }, 400);
  }

  return json({ ok: true, summary });
};

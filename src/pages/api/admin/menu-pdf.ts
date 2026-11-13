export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { buildMenuPdf } from '../../../server/pdf';
import { sbGetPublicBook } from '../../../server/supabase-cms';
import { guardStaff } from '../../../server/staff-auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  const pages = isSupabaseConfigured() && auth.supabase ? await sbGetPublicBook(auth.supabase) : undefined;
  const bytes = await buildMenuPdf(pages);
  return new Response(Buffer.from(bytes), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="zin-gin-menu-a5.pdf"',
      'cache-control': 'no-store',
    },
  });
};

export const prerender = false;

import type { APIRoute } from 'astro';
import { createSupabaseAnonClient } from '../../lib/supabase/anon';
import { isSupabaseConfigured } from '../../lib/supabase/env';
import { getPublicBook } from '../../server/db';
import { sbGetPublicBook } from '../../server/supabase-cms';
import { json } from '../../server/http';

function isEmptyBook(pages: Awaited<ReturnType<typeof sbGetPublicBook>>) {
  return !pages.length || (pages.length === 1 && pages[0].id === 'empty' && !pages[0].groups.length);
}

export const GET: APIRoute = async () => {
  if (isSupabaseConfigured()) {
    try {
      const pages = await sbGetPublicBook(createSupabaseAnonClient());
      if (isEmptyBook(pages)) {
        return json({ pages: getPublicBook() });
      }
      return json({ pages });
    } catch {
      return json({ pages: getPublicBook() });
    }
  }
  return json({ pages: getPublicBook() });
};

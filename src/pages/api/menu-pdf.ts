export const prerender = false;

import type { APIRoute } from 'astro';
import { buildMenuPdf } from '../../server/pdf';

export const GET: APIRoute = async () => {
  const bytes = await buildMenuPdf();
  return new Response(Buffer.from(bytes), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="zin-gin-menu.pdf"',
      'cache-control': 'no-store',
    },
  });
};

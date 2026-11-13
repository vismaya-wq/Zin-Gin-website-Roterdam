export const prerender = false;

import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../../lib/supabase/env';
import { saveUpload } from '../../../server/db';
import { sbUploadImage } from '../../../server/supabase-cms';
import { guardStaff } from '../../../server/staff-auth';
import { json } from '../../../server/http';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await guardStaff(cookies, request, 'owner');
  if ('error' in auth) return auth.error;

  const form = await request.formData();
  const file = form.get('file');
  const bucket = (form.get('bucket') || 'gallery') as 'gallery' | 'events' | 'menu';
  if (!(file instanceof File)) return json({ error: 'Choose an image.' }, 400);
  if (file.size > 1_500_000) return json({ error: 'Use an image under 1.5 MB.' }, 400);
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    return json({ error: 'Use a JPG, PNG or WebP image.' }, 400);
  }
  const bytes = Buffer.from(await file.arrayBuffer());

  if (isSupabaseConfigured() && auth.supabase) {
    const safeBucket = bucket === 'menu' || bucket === 'events' ? bucket : 'gallery';
    const result = await sbUploadImage(auth.supabase, safeBucket, file.name || 'image.jpg', bytes, file.type);
    if ('error' in result && result.error) return json({ error: result.error }, 400);
    return json({ url: result.url });
  }

  const url = saveUpload(file.name || 'image.jpg', bytes);
  return json({ url });
};

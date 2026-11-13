export const prerender = false;

import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';
import { readUpload } from '../../../server/db';

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export const GET: APIRoute = ({ params }) => {
  const file = readUpload(params.name || '');
  if (!file) return new Response('Not found', { status: 404 });
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  return new Response(fs.readFileSync(file), { headers: { 'content-type': type, 'cache-control': 'public, max-age=86400' } });
};

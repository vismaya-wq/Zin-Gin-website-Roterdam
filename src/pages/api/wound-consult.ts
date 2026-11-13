export const prerender = false;

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import type { APIRoute } from 'astro';
import { CONCERNS, type ConsultSource } from '../../data/wound';
import { json } from '../../server/http';

const SOURCES = new Set<ConsultSource>(['hero', 'situations', 'diabetic', 'treats', 'doctor', 'faq', 'final']);
const hits = new Map<string, number[]>();

const DIR =
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join('/tmp', 'zin-gin')
    : path.join(process.cwd(), 'data', 'runtime');
const FILE = path.join(DIR, 'wound-leads.json');

function allow(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((stamp) => now - stamp < 10 * 60 * 1000);
  if (recent.length >= 6) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

function text(value: unknown, max: number) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || 'local';
  if (!allow(ip)) {
    return json({ error: 'Too many requests. Please call 84949 06440.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Send the request as JSON.' }, 400);
  }

  if (text(body.company, 80)) return json({ ok: true });

  const name = text(body.name, 80);
  const phone = text(body.phone, 15).replace(/\D/g, '');
  const concern = text(body.concern, 40);
  const source = text(body.source, 20) as ConsultSource;

  if (name.length < 2) return json({ error: 'Enter your name.' }, 400);
  if (!/^[6-9]\d{9}$/.test(phone)) return json({ error: 'Enter a 10-digit mobile number.' }, 400);
  if (!CONCERNS.some((item) => item.value === concern)) return json({ error: 'Select the problem.' }, 400);
  if (!SOURCES.has(source)) return json({ error: 'Select a form.' }, 400);

  const lead = {
    id: randomBytes(8).toString('hex'),
    name,
    phone,
    concern,
    source,
    createdAt: new Date().toISOString(),
  };

  await fs.mkdir(DIR, { recursive: true });
  let existing: unknown[] = [];
  try {
    existing = JSON.parse(await fs.readFile(FILE, 'utf8'));
    if (!Array.isArray(existing)) existing = [];
  } catch {
    existing = [];
  }
  existing.push(lead);
  await fs.writeFile(FILE, JSON.stringify(existing, null, 2));
  return json({ ok: true });
};

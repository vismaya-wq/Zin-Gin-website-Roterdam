/**
 * Quick Supabase connectivity check (run from project root).
 * Needs SUPABASE_URL + SUPABASE_ANON_KEY in .env or environment.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';

function loadDotEnv() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 1) continue;
    const key = trimmed.slice(0, i).trim();
    const val = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv();

const url = (process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '').trim();
const key = (process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();

console.log('--- Zin & Gin Supabase check ---\n');

if (!url || !key) {
  console.log('FAIL: Missing SUPABASE_URL and/or SUPABASE_ANON_KEY.');
  console.log('Create a .env file from .env.example and paste your Project URL + anon key.');
  process.exit(1);
}

console.log('OK: Env vars present');
console.log('    URL:', url.replace(/^(https:\/\/[^.]+).*/, '$1…'));

const supabase = createClient(url, key);

const tables = ['menu_categories', 'menu_items', 'reservations', 'events', 'gallery', 'profiles'];

for (const table of tables) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) {
    console.log(`FAIL: table "${table}" — ${error.message}`);
    if (error.message.includes('does not exist') || error.code === '42P01') {
      console.log('     → Run supabase/migrations/001_core_schema.sql in the Supabase SQL editor.');
    }
    continue;
  }
  console.log(`OK:   ${table} (${count ?? 0} rows)`);
}

console.log('\nIf all tables show OK, link the same keys in Netlify and redeploy the site.');
console.log('Live site uses Supabase only when those env vars exist at build/runtime on Netlify.\n');

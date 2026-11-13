import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const text = fs.readFileSync(path.join(root, 'src/data/gallery.ts'), 'utf8');
const items = [];
const re = /src:\s*'([^']+)'[\s\S]*?alt:\s*'([^']*)'[\s\S]*?caption:\s*'([^']*)'/g;
let m;
while ((m = re.exec(text))) items.push({ src: m[1], alt: m[2], caption: m[3] });

const esc = (s) => s.replace(/'/g, "''");
const base = process.argv[2] ?? '';
const values = items
  .map((it, i) => {
    const url = base + it.src;
    const cap = esc(it.caption || it.alt);
    return `('${url}', '${cap}', ${i}, true)`;
  })
  .join(',\n  ');

const sql = `DELETE FROM public.gallery;\nINSERT INTO public.gallery (image_url, caption, sort_order, visible) VALUES\n  ${values};\n`;
const out = path.join(__dirname, 'gallery-seed.sql');
fs.writeFileSync(out, sql);
console.log(`Wrote ${items.length} rows to ${out}`);

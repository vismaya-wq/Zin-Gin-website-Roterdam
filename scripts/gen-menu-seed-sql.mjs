import fs from 'node:fs';
import { CATEGORIES, MENU } from '../src/data/menu.ts';

const tagFlags = (tags) => ({
  is_veg: tags.includes('VEG'),
  is_vegan: tags.includes('VEGAN'),
  has_gluten: tags.includes('GF'),
  has_nuts: tags.includes('NUTS'),
  is_spicy: tags.includes('SPICY'),
});

const esc = (value) => String(value).replace(/'/g, "''");

let sql = '-- seed menu from src/data/menu.ts\n';
const cats = CATEGORIES.filter((c) => c.id !== 'popular');
for (const [index, category] of cats.entries()) {
  sql += `INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('${esc(category.label)}', '${category.id}', ${index}, true) ON CONFLICT (slug) DO NOTHING;\n`;
}
let sortOrder = 0;
for (const item of MENU) {
  const flags = tagFlags(item.tags || []);
  const image = item.image ? `'${esc(item.image)}'` : 'NULL';
  sql += `INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, '${esc(item.name)}', '${esc(item.description)}', ${item.price}, ${flags.is_veg}, ${flags.is_vegan}, ${flags.has_gluten}, ${flags.has_nuts}, ${flags.is_spicy}, true, ${sortOrder++}, ${image}
FROM menu_categories WHERE slug = '${item.category}';\n`;
}

fs.writeFileSync(new URL('../supabase/migrations/002_seed_menu.sql', import.meta.url), sql);
console.log(`Wrote ${cats.length} categories and ${MENU.length} items.`);

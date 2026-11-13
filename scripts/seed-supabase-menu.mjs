/**
 * One-off seed: menu categories + items from src/data/menu.ts
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server only).
 */
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES, MENU } from '../src/data/menu.ts';

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const tagMap = (tags) => ({
  is_veg: tags.includes('VEG'),
  is_vegan: tags.includes('VEGAN'),
  has_gluten: tags.includes('GF'),
  has_nuts: tags.includes('NUTS'),
  is_spicy: tags.includes('SPICY'),
});

const { count } = await supabase.from('menu_categories').select('*', { count: 'exact', head: true });
if (count && count > 0) {
  console.log('Menu categories already exist — skipping seed.');
  process.exit(0);
}

const categories = CATEGORIES.filter((c) => c.id !== 'popular').map((c, index) => ({
  name: c.label,
  slug: c.id,
  sort_order: index,
  visible: true,
}));

const { data: insertedCats, error: catError } = await supabase.from('menu_categories').insert(categories).select('id, slug');
if (catError) {
  console.error(catError.message);
  process.exit(1);
}

const slugToId = new Map(insertedCats.map((c) => [c.slug, c.id]));
const items = MENU.map((item, index) => ({
  category_id: slugToId.get(item.category),
  name: item.name,
  description: item.description,
  price: item.price,
  visible: item.available !== false,
  sort_order: index,
  image_url: item.image || null,
  ...tagMap(item.tags || []),
}));

const { error: itemError } = await supabase.from('menu_items').insert(items);
if (itemError) {
  console.error(itemError.message);
  process.exit(1);
}

console.log(`Seeded ${categories.length} categories and ${items.length} menu items.`);

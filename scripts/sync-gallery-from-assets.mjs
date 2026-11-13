/**
 * Copy *-edited-*.jpg from Cursor assets into public/gallery/NN.jpg (sorted by slug)
 * and regenerate src/data/gallery.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir =
  process.env.GALLERY_ASSETS_DIR ??
  path.join(
    process.env.USERPROFILE ?? '',
    '.cursor',
    'projects',
    'c-Users-visma-Documents-Zin-Gin-website-Roterdam',
    'assets',
  );
const destDir = path.join(root, 'public', 'gallery');
const galleryTs = path.join(root, 'src', 'data', 'gallery.ts');

const SLUG_META = {
  'bean-curry-garlic-naan': ['Curry with garlic naan on the side', 'Slow curry, warm bread.'],
  biryani: ['Vegetable biryani in a serving bowl', 'Fragrant rice, layered spice.'],
  'breakfast-combo': ['South Indian breakfast combo on one plate', 'A proper morning spread.'],
  'brown-curry': ['Brown vegetarian curry in a bowl', 'Rich, slow and deeply comforting.'],
  'catalog-bhel': ['Bhel puri with sev and chutney', 'Crunchy, tangy street food.'],
  'catalog-dal-rice': ['Dal and rice with pickle', 'Homely and satisfying.'],
  'catalog-dosa': ['Crisp dosa with chutneys', 'Made for dipping.'],
  'catalog-milk-dessert': ['Indian milk dessert in a bowl', 'A sweet ending.'],
  'catalog-momos': ['Steamed momos with dip', 'Soft parcels, bold dip.'],
  'catalog-onion-uttapam': ['Onion uttapam from the griddle', 'Crisp edges, soft centre.'],
  'catalog-pav-bhaji': ['Pav bhaji with buttered buns', 'Mumbai comfort on a plate.'],
  'catalog-raita': ['Cool raita with fresh herbs', 'The perfect side.'],
  'catalog-savory-balls': ['Savory lentil balls with chutney', 'Small bites, big flavour.'],
  'chaat-bowl': ['Chaat served in a bowl', 'Bright, tangy, impossible to stop.'],
  'chaat-platter': ['Chaat platter with yoghurt and chutney', 'Street flavours, shared.'],
  'chilli-bites': ['Chilli paneer bites on a plate', 'Wok heat and Indo-Chinese spice.'],
  'chole-bhature': ['Chole bhature with fluffy bread', 'Weekend breakfast energy.'],
  'cone-dosa': ['Cone dosa with fillings', 'Crisp, fun and made to share.'],
  'dahi-puri': ['Dahi puri with cool yoghurt', 'Sweet, sour and crunchy.'],
  'dal-naan': ['Dal with fresh naan', 'From the tandoor to the table.'],
  'filled-bun': ['Filled bun with spiced stuffing', 'Grab-and-go comfort.'],
  'fruit-custard': ['Fruit custard in a glass', 'Something cool and sweet.'],
  'griddle-uttapam': ['Uttapam cooking on the griddle', 'Fresh from the pan.'],
  'gulab-jamun': ['Gulab jamun in syrup', 'Warm and indulgent.'],
  idli: ['Idli with sambar and chutney', 'Steamed, light and classic.'],
  'mint-lime-drink': ['Mint and lime cooler in a glass', 'Something cold and refreshing.'],
  'misal-pav': ['Misal pav with spicy usal', 'Pune-style heat and crunch.'],
  'misal-vada-meal': ['Misal with vada on the side', 'A hearty Maharashtrian plate.'],
  'mixed-vegetable-curry': ['Mixed vegetable curry', 'Colour on the plate.'],
  'naan-basket': ['Basket of fresh naan bread', 'Fresh from the tandoor.'],
  'orange-curry': ['Orange-hued vegetable curry', 'Creamy tomato warmth.'],
  'orange-dessert': ['Orange-tinted Indian dessert', 'Finish with something sweet.'],
  'pani-puri': ['Pani puri ready to eat', 'One bite, full flavour.'],
  'patties-platter': ['Golden patties on a platter', 'Hot from the counter.'],
  'plated-orange-curry': ['Plated orange curry with rice', 'Dinner that runs long.'],
  'plated-samosas': ['Plated samosas with chutney', 'Crisp parcels to share.'],
  'plated-yellow-curry': ['Yellow curry on a white plate', 'Sunshine on the plate.'],
  'puri-chaat-pair': ['Puri chaat pair on a plate', 'Tangy street classics.'],
  'rice-and-chilli-combo': ['Rice with chilli paneer combo', 'Heat meets comfort.'],
  'rice-combo-meal': ['Rice combo thali-style meal', 'Everything in one spread.'],
  'rose-drink': ['Rose-flavoured drink in a glass', 'Something floral at the bar.'],
  'drink-02': ['Layered cocktail with fruit in a faceted glass', 'Something cold and celebratory.'],
  'salad-platter': ['Fresh salad and sides platter', 'Bright crunch between courses.'],
  samosas: ['Golden samosas with chutney', 'Samosas, ready for the table.'],
  'saucy-noodles': ['Saucy Indo-Chinese noodles', 'Wok-tossed and bold.'],
  'savory-balls': ['Savory fritters with dip', 'Crisp outside, soft within.'],
  'tikki-chaat': ['Aloo tikki chaat with chutneys', 'Street food at its best.'],
  'triangle-dosa': ['Triangle-cut masala dosa', 'Crisp dosa, spiced potato.'],
  vada: ['Medu vada with chutney', 'Crisp lentil doughnuts.'],
  'vada-pav': ['Vada pav in a soft bun', 'Mumbai on a plate.'],
  'vegetable-dish': ['Seasonal vegetable dish', 'Honest, vegetarian cooking.'],
  'vegetable-noodles': ['Vegetable noodles stir-fry', 'Indo-Chinese comfort.'],
  'vegetable-rice': ['Vegetable pulao rice', 'Fragrant basmati.'],
  'white-bowl-curry': ['Curry served in a white bowl', 'Slow-cooked comfort.'],
  'yogurt-dish': ['Yoghurt-based raita or chaat base', 'Cool against the spice.'],
};

function slugFromName(filename) {
  const edited = filename.match(/_images_(.+)-edited-/);
  if (edited) return edited[1];
  const preview = filename.match(/_images_(.+)-original-background-preview-/);
  if (preview) return preview[1];
  return filename;
}

function humanize(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function metaFor(slug, index) {
  const pair = SLUG_META[slug];
  const alt = pair?.[0] ?? `${humanize(slug)} at Zin & Gin`;
  const caption = pair?.[1] ?? 'From our kitchen.';
  const wide = index % 11 === 0 || index % 17 === 3;
  const tall = index % 9 === 4 || index % 13 === 6;
  return { alt, caption, wide: wide || undefined, tall: tall || undefined };
}

if (!fs.existsSync(assetsDir)) {
  console.error('Assets dir not found:', assetsDir);
  process.exit(1);
}

const files = fs
  .readdirSync(assetsDir)
  .filter(
    (f) =>
      f.endsWith('.jpg') &&
      (f.includes('-edited-') || f.includes('-original-background-preview-')),
  )
  .map((f) => ({ name: f, slug: slugFromName(f), full: path.join(assetsDir, f) }))
  .filter((f) => f.slug !== 'drink-02')
  .sort((a, b) => a.slug.localeCompare(b.slug) || a.name.localeCompare(b.name));

const drink02 = fs
  .readdirSync(assetsDir)
  .find((f) => f.includes('drink-02') && f.endsWith('.jpg'));

fs.mkdirSync(destDir, { recursive: true });

const manifest = [];
files.forEach((file, i) => {
  const num = String(i + 1).padStart(2, '0');
  const dest = path.join(destDir, `${num}.jpg`);
  fs.copyFileSync(file.full, dest);
  manifest.push({ num: i + 1, slug: file.slug, src: `/gallery/${num}.jpg` });
});

if (drink02) {
  const num = files.length + 1;
  const dest = path.join(destDir, `${String(num).padStart(2, '0')}.jpg`);
  fs.copyFileSync(path.join(assetsDir, drink02), dest);
  manifest.push({ num, slug: 'drink-02', src: `/gallery/${String(num).padStart(2, '0')}.jpg` });
}

const items = manifest.map(({ num, slug, src }) => {
  const { alt, caption, wide, tall } = metaFor(slug, num);
  const lines = [`  {`, `    src: '${src}',`, `    alt: '${alt.replace(/'/g, "\\'")}',`, `    caption: '${caption.replace(/'/g, "\\'")}',`];
  if (wide) lines.push('    wide: true,');
  if (tall) lines.push('    tall: true,');
  lines.push('  },');
  return lines.join('\n');
});

const ts = `export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  /** Wider tile on desktop */
  wide?: boolean;
  /** Taller tile on desktop */
  tall?: boolean;
};

/** ${manifest.length} photos — synced from assets via scripts/sync-gallery-from-assets.mjs */
export const GALLERY: GalleryItem[] = [
${items.join('\n')}
];
`;

fs.writeFileSync(galleryTs, ts);
fs.writeFileSync(
  path.join(root, 'scripts', 'gallery-manifest.json'),
  JSON.stringify(manifest, null, 2),
);

console.log(`Copied ${manifest.length} images to public/gallery/`);
console.log('Updated src/data/gallery.ts and scripts/gallery-manifest.json');

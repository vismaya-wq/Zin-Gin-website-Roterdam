import type { CategoryId, DietaryTag } from '../data/menu';
import type { MenuRecord } from '../data/ops';

export const MENU_CSV_HEADERS = [
  'id',
  'action',
  'category',
  'name',
  'description',
  'price',
  'vegetarian',
  'vegan',
  'gluten',
  'nuts',
  'spicy',
  'visible',
  'sort_order',
] as const;

const TAGS: { column: (typeof MENU_CSV_HEADERS)[number]; tag: DietaryTag }[] = [
  { column: 'vegetarian', tag: 'VEG' },
  { column: 'vegan', tag: 'VEGAN' },
  { column: 'gluten', tag: 'GF' },
  { column: 'nuts', tag: 'NUTS' },
  { column: 'spicy', tag: 'SPICY' },
];

export interface MenuCsvRow {
  line: number;
  action: 'ADD' | 'UPDATE' | 'DELETE';
  id: string;
  category: string;
  name: string;
  description: string;
  price: string;
  vegetarian: string;
  vegan: string;
  gluten: string;
  nuts: string;
  spicy: string;
  visible: string;
  sort_order: string;
}

function cell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function flag(tags: DietaryTag[], tag: DietaryTag) {
  return tags.includes(tag) ? 'yes' : 'no';
}

export function menuToCsv(items: MenuRecord[]) {
  const lines = [MENU_CSV_HEADERS.join(',')];
  for (const item of items) {
    lines.push(
      [
        item.id,
        'UPDATE',
        item.category,
        item.name,
        item.description,
        String(item.price),
        flag(item.tags, 'VEG'),
        flag(item.tags, 'VEGAN'),
        flag(item.tags, 'GF'),
        flag(item.tags, 'NUTS'),
        flag(item.tags, 'SPICY'),
        item.available ? 'yes' : 'no',
        String(item.sortOrder),
      ]
        .map((value) => cell(value))
        .join(','),
    );
  }
  return `${lines.join('\n')}\n`;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          value += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        value += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((cellValue) => cellValue.trim()));
}

function yes(value: string) {
  return ['yes', 'true', '1', 'y'].includes(value.trim().toLowerCase());
}

export function parseMenuCsv(text: string, items: MenuRecord[], categories: { id: string }[]) {
  const table = parseCsv(text);
  const errors: { line: number; message: string }[] = [];
  const rows: MenuCsvRow[] = [];
  if (!table.length) {
    return { rows, errors: [{ line: 1, message: 'The file is empty.' }] };
  }
  const header = table[0].map((column) => column.trim());
  const missing = MENU_CSV_HEADERS.filter((column) => !header.includes(column));
  if (missing.length) {
    return { rows, errors: [{ line: 1, message: `Missing columns: ${missing.join(', ')}.` }] };
  }
  const index = new Map(header.map((column, position) => [column, position]));
  const known = new Map(items.map((item) => [item.id, item]));
  const categoryIds = new Set(categories.map((category) => category.id));
  const seenIds = new Set<string>();
  const seenAdds = new Set<string>();

  table.slice(1).forEach((cells, offset) => {
    const line = offset + 2;
    const read = (column: (typeof MENU_CSV_HEADERS)[number]) => (cells[index.get(column) ?? -1] || '').trim();
    const action = read('action').toUpperCase();
    if (!['ADD', 'UPDATE', 'DELETE'].includes(action)) {
      errors.push({ line, message: 'Action must be ADD, UPDATE or DELETE.' });
      return;
    }
    const row: MenuCsvRow = {
      line,
      action: action as MenuCsvRow['action'],
      id: read('id'),
      category: read('category'),
      name: read('name'),
      description: read('description'),
      price: read('price'),
      vegetarian: read('vegetarian'),
      vegan: read('vegan'),
      gluten: read('gluten'),
      nuts: read('nuts'),
      spicy: read('spicy'),
      visible: read('visible'),
      sort_order: read('sort_order'),
    };
    if (row.id && seenIds.has(row.id)) errors.push({ line, message: 'This item ID appears more than once.' });
    if (row.id) seenIds.add(row.id);

    if (row.action === 'DELETE') {
      if (!row.id || !known.has(row.id)) errors.push({ line, message: 'DELETE needs an existing item ID.' });
      rows.push(row);
      return;
    }

    if (row.action === 'UPDATE' && (!row.id || !known.has(row.id))) {
      errors.push({ line, message: 'UPDATE needs an existing item ID.' });
    }
    if (row.name.length < 2) errors.push({ line, message: 'Add a dish name.' });
    if (!categoryIds.has(row.category)) errors.push({ line, message: 'Category is not recognised.' });
    const price = Number(row.price);
    if (!Number.isFinite(price) || price < 0 || price > 500) errors.push({ line, message: 'Price must be a number from 0 to 500.' });
    if (row.sort_order && !Number.isFinite(Number(row.sort_order))) errors.push({ line, message: 'Sort order must be a number.' });
    if (row.action === 'ADD') {
      const key = `${row.category}:${row.name.toLowerCase()}`;
      const exists = items.some((item) => item.category === row.category && item.name.toLowerCase() === row.name.toLowerCase());
      if (exists || seenAdds.has(key)) errors.push({ line, message: 'This dish already exists in that category.' });
      seenAdds.add(key);
    }
    rows.push(row);
  });

  return { rows, errors };
}

export function rowToMenuInput(row: MenuCsvRow) {
  const tags = TAGS.filter((entry) => yes(row[entry.column])).map((entry) => entry.tag);
  return {
    name: row.name,
    category: row.category as CategoryId,
    description: row.description,
    price: Number(row.price),
    tags,
    available: row.visible ? yes(row.visible) : true,
    sortOrder: row.sort_order ? Number(row.sort_order) : undefined,
  };
}

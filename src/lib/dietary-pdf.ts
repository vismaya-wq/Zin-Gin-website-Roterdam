import { rgb, type PDFPage } from 'pdf-lib';
import type { DietaryTag } from '../data/menu';

const leaf = rgb(61 / 255, 143 / 255, 94 / 255);
const gf = rgb(199 / 255, 101 / 255, 60 / 255);

function drawLeaf(page: PDFPage, x: number, y: number) {
  page.drawEllipse({ x: x + 4, y: y + 3, xScale: 4, yScale: 5, color: leaf, borderWidth: 0 });
  page.drawLine({ start: { x: x + 4, y: y - 1 }, end: { x: x + 4, y: y + 7 }, thickness: 0.8, color: leaf });
}

function drawGlutenFree(page: PDFPage, x: number, y: number) {
  page.drawCircle({ x: x + 4, y: y + 3, size: 4, borderColor: gf, borderWidth: 0.8 });
  page.drawLine({ start: { x: x + 1.5, y: y + 0.5 }, end: { x: x + 6.5, y: y + 5.5 }, thickness: 0.7, color: gf });
  page.drawLine({ start: { x: x + 6.5, y: y + 0.5 }, end: { x: x + 1.5, y: y + 5.5 }, thickness: 0.7, color: gf });
}

export function drawDietaryIcons(page: PDFPage, x: number, y: number, tags: DietaryTag[]) {
  const unique = [...new Set(tags)];
  let cursor = x;
  for (const tag of unique) {
    if (tag === 'VEG' || tag === 'VEGAN') {
      drawLeaf(page, cursor, y);
      cursor += 11;
    }
    if (tag === 'GF') {
      drawGlutenFree(page, cursor, y);
      cursor += 11;
    }
    if (tag === 'SPICY') {
      page.drawCircle({ x: cursor + 4, y: y + 3, size: 3, color: rgb(199 / 255, 101 / 255, 60 / 255) });
      cursor += 11;
    }
    if (tag === 'NUTS') {
      page.drawEllipse({ x: cursor + 4, y: y + 3, xScale: 3.5, yScale: 4, borderColor: gf, borderWidth: 0.7 });
      cursor += 11;
    }
  }
  return cursor;
}

export function dietaryIconWidth(tags: DietaryTag[]) {
  const unique = [...new Set(tags)];
  let w = 0;
  for (const tag of unique) {
    if (tag === 'VEG' || tag === 'VEGAN') w += 11;
    if (tag === 'GF') w += 11;
    if (tag === 'SPICY') w += 11;
    if (tag === 'NUTS') w += 11;
  }
  return w;
}

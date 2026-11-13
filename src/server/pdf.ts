import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { getPublicBook } from './db';
import { formatPrice, type DietaryTag } from '../data/menu';
import { drawDietaryIcons } from '../lib/dietary-pdf';

const petrol = rgb(6 / 255, 76 / 255, 79 / 255);
const terra = rgb(199 / 255, 101 / 255, 60 / 255);
const ink = rgb(23 / 255, 23 / 255, 23 / 255);
const soft = rgb(80 / 255, 80 / 255, 80 / 255);
const ivory = rgb(243 / 255, 235 / 255, 221 / 255);

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

const PAGE_W = 419.53;
const PAGE_H = 595.28;
const LEFT = 28;
const RIGHT = PAGE_W - 28;

export async function buildMenuPdf(pages = getPublicBook()) {
  const doc = await PDFDocument.create();
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - 36;

  const fresh = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - 36;
    paintFooter(page, sans);
  };

  const need = (height: number) => {
    if (y - height < 48) fresh();
  };

  const paintFooter = (target: PDFPage, font: PDFFont) => {
    target.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 28, color: petrol });
    target.drawText('Zin & Gin  ·  Vegetarian restaurant & bar  ·  Rotterdam', {
      x: LEFT,
      y: 10,
      size: 7,
      font,
      color: ivory,
    });
  };

  page.drawRectangle({ x: 0, y: PAGE_H - 72, width: PAGE_W, height: 72, color: petrol });
  page.drawText('Zin & Gin', { x: LEFT, y: PAGE_H - 36, size: 22, font: serif, color: ivory });
  page.drawText('Vegetarian Restaurant & Bar', { x: LEFT, y: PAGE_H - 52, size: 9, font: sans, color: ivory });
  paintFooter(page, sans);
  y = PAGE_H - 96;

  const hours = wrap('Dinner Mon–Sun 17:00–21:30. Breakfast Mon–Fri 07:30–10:00, Sat–Sun 08:00–10:30.', sans, 8, RIGHT - LEFT);
  for (const line of hours) {
    page.drawText(line, { x: LEFT, y, size: 8, font: sans, color: soft });
    y -= 11;
  }
  y -= 8;

  page.drawText('Icons: leaf vegetarian, sprout vegan, wheat gluten, nut, chilli spicy.', {
    x: LEFT,
    y,
    size: 7,
    font: sans,
    color: soft,
  });
  y -= 18;

  for (const spread of pages) {
    for (const group of spread.groups) {
      need(32);
      page.drawText(group.label.toUpperCase(), { x: LEFT, y, size: 10, font: sansBold, color: terra });
      y -= 6;
      page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.4, color: terra });
      y -= 16;

      for (const item of group.items) {
        const description = item.description ? wrap(item.description, serif, 8, RIGHT - LEFT - 58) : [];
        need(16 + description.length * 11);
        const price = formatPrice(item.price);
        const tags = item.tags as DietaryTag[];
        page.drawText(item.name, { x: LEFT, y, size: 11, font: serifBold, color: ink });
        const priceWidth = sansBold.widthOfTextAtSize(price, 9);
        page.drawText(price, { x: RIGHT - priceWidth, y, size: 9, font: sansBold, color: petrol });
        if (tags.length) {
          const nameWidth = serifBold.widthOfTextAtSize(item.name, 11);
          const iconX = Math.min(LEFT + nameWidth + 6, RIGHT - priceWidth - 70);
          drawDietaryIcons(page, iconX, y - 1, tags);
        }
        y -= 12;
        for (const line of description) {
          page.drawText(line, { x: LEFT, y, size: 8, font: serif, color: soft });
          y -= 10;
        }
        y -= 5;
      }
      y -= 8;
    }
  }

  need(40);
  page.drawText('Prices in euro. Ask us about allergens when you order.', {
    x: LEFT,
    y,
    size: 9,
    font: serif,
    color: soft,
  });

  doc.setTitle('Zin & Gin menu');
  doc.setAuthor('Zin & Gin');
  return doc.save();
}

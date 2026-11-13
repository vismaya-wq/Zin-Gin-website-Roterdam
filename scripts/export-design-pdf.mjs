/**
 * Builds a multi-page design PDF (full-length screenshots) for Home, Menu, and Reserve.
 * Requires a running preview server — run `npm run serve` first, or pass PREVIEW_URL.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'exports');
const baseUrl = (process.env.PREVIEW_URL || 'http://localhost:4321').replace(/\/$/, '');

const ROUTES = [
  { slug: '01-home', label: 'Home', path: '/' },
  { slug: '02-menu', label: 'Menu', path: '/menu' },
  { slug: '03-menu-takeaway', label: 'Menu (takeaway)', path: '/menu?takeaway=1' },
  { slug: '04-reserve', label: 'Reserve / Order', path: '/reserve' },
];

const HIDE_UI_CSS = `
  .skip-link,
  .fbar,
  .drawer,
  .drawer-backdrop,
  .takeaway-strip { display: none !important; }
  [data-nav] { position: relative !important; transform: none !important; }
  html, body { overflow: visible !important; height: auto !important; }
`;

function ping(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    if (await ping(url)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Preview server not reachable at ${url}. Run: npm run serve`);
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(280, Math.floor(window.innerHeight * 0.65));
    let y = 0;
    const max = document.documentElement.scrollHeight;
    while (y < max) {
      window.scrollTo(0, y);
      await delay(120);
      y += step;
    }
    window.scrollTo(0, 0);
    await delay(200);
    y = 0;
    while (y < max) {
      window.scrollTo(0, y);
      await delay(80);
      y += step;
    }
    window.scrollTo(0, 0);
  });
}

async function captureRoute(browser, route) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.addStyleTag({ content: HIDE_UI_CSS });
  await page.waitForTimeout(800);
  await autoScroll(page);
  await page.waitForTimeout(600);

  const png = await page.screenshot({ fullPage: true, type: 'png' });
  await context.close();
  return png;
}

async function pngPagesToPdf(pngBuffers, outFile) {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Zin & Gin — Website design');
  pdf.setAuthor('Zin & Gin Rotterdam');

  for (const png of pngBuffers) {
    const image = await pdf.embedPng(png);
    const w = image.width;
    const h = image.height;
    const page = pdf.addPage([w, h]);
    page.drawImage(image, { x: 0, y: 0, width: w, height: h });
  }

  const bytes = await pdf.save();
  fs.writeFileSync(outFile, bytes);
}

async function main() {
  if (!(await ping(baseUrl))) {
    console.log('Starting preview server (npm run preview)...');
    const child = spawn('npm', ['run', 'preview'], {
      cwd: root,
      shell: true,
      stdio: 'ignore',
      detached: true,
    });
    child.unref();
    await waitForServer(baseUrl);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const captures = [];

  try {
    for (const route of ROUTES) {
      console.log(`Capturing ${route.label}…`);
      const png = await captureRoute(browser, route);
      const singlePath = path.join(outDir, `${route.slug}.png`);
      fs.writeFileSync(singlePath, png);
      captures.push({ route, png });
    }
  } finally {
    await browser.close();
  }

  const pdfPath = path.join(outDir, 'Zin-Gin-website-design.pdf');
  await pngPagesToPdf(captures.map((c) => c.png), pdfPath);

  console.log('');
  console.log('Done.');
  console.log(`  PDF: ${pdfPath}`);
  console.log(`  PNGs: ${outDir}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

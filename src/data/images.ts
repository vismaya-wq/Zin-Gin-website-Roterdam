/** Client food photography under /public/gallery (see scripts/sync-gallery-from-assets.mjs). */
export const GALLERY_IMAGE_COUNT = 62;

const isLocal = (value: string) => value.startsWith('/') || value.startsWith('http');

/** Unsplash ids still work; local paths pass through unchanged. */
export const photo = (id: string, width = 1600, quality = 78) => {
  if (isLocal(id)) return id;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
};

export const srcset = (id: string, widths = [720, 1200, 1800, 2400]) => {
  if (isLocal(id)) return id;
  return widths.map((w) => `${photo(id, w)} ${w}w`).join(', ');
};

/** Curated picks from the gallery for homepage, menu and events. */
export const IMAGES = {
  /** Homepage hero — thali on brass tray (`public/images/hero-feast.jpg`). */
  heroFeast: '/images/hero-feast.jpg',
  thaliDark: '/gallery/42.jpg',
  thaliWarm: '/gallery/03.jpg',
  thaliSteel: '/gallery/21.jpg',
  pavPlatter: '/gallery/12.jpg',
  interiorMoody: '/gallery/31.jpg',
  interiorWarm: '/gallery/24.jpg',
  friendsDinner: '/gallery/42.jpg',
  masalaDosa: '/gallery/08.jpg',
  paneerTikka: '/gallery/17.jpg',
  biryaniDark: '/gallery/02.jpg',
  vegPulao: '/gallery/57.jpg',
  chaat: '/gallery/16.jpg',
  paniPuri: '/gallery/35.jpg',
  samosa: '/gallery/38.jpg',
  pavBhaji: '/gallery/12.jpg',
  idliVada: '/gallery/26.jpg',
  cocktailDark: '/gallery/62.jpg',
  cocktailPour: '/gallery/27.jpg',
} as const;

/** Local top-view plates for homepage overflow (replace with client artwork anytime). */
export const LOCAL_IMAGES = {
  naanPlateTop: '/images/naan-plate-top.jpg',
  thaliTopRight: '/images/thali-top-right.jpg',
  /** Outlined naan + dips (white on black export — use mix-blend-mode: screen in CSS). */
  cornerPlateOutline: '/images/corner-plate-outline.png',
} as const;

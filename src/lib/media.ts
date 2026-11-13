import { photo } from '../data/images';

/** Unsplash ids, uploaded paths and absolute URLs all resolve to an img src. */
export function mediaSrc(image: string | undefined, width = 900) {
  if (!image) return '';
  if (image.startsWith('/') || image.startsWith('http')) return image;
  return photo(image, width);
}

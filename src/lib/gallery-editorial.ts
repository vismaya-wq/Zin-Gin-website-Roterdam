/** Shared editorial labels for the public gallery and admin previews. */
export function galleryEditorialKicker(alt: string, caption: string) {
  const text = `${alt} ${caption}`.toLowerCase();
  if (/breakfast|dosa|idli|paratha|chai|vada|uttapam/.test(text)) return 'Breakfast';
  if (/bar|cocktail|gin|drink|lager|beer|wine/.test(text)) return 'Bar';
  if (/room|dining|table|buffet|service/.test(text)) return 'Dining room';
  if (/street|chaat|momos|pav|samosa|bhel/.test(text)) return 'Street food';
  if (/dessert|kulfi|sweet|gulab/.test(text)) return 'Desserts';
  return 'Kitchen';
}

export function galleryEditorialTitle(alt: string, caption: string) {
  const cap = (caption || '').trim();
  if (cap.length > 2) return cap;
  return alt.replace(/\.$/, '');
}

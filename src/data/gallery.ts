export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  /** Wider tile on desktop */
  wide?: boolean;
  /** Taller tile on desktop */
  tall?: boolean;
};

/** Curated public gallery. Extra source photos stay off this page so it loads faster. */
export const GALLERY: GalleryItem[] = [
  {
    src: '/gallery/03.jpg',
    alt: 'South Indian breakfast combo on one plate',
    caption: 'A proper morning spread.',
    wide: true,
  },
  {
    src: '/gallery/08.jpg',
    alt: 'Crisp dosa with chutneys',
    caption: 'Made for dipping.',
  },
  {
    src: '/gallery/26.jpg',
    alt: 'Idli with sambar and chutney',
    caption: 'Steamed, light and classic.',
  },
  {
    src: '/gallery/02.jpg',
    alt: 'Vegetable biryani in a serving bowl',
    caption: 'Fragrant rice, layered spice.',
  },
  {
    src: '/gallery/42.jpg',
    alt: 'Rice combo thali-style meal',
    caption: 'Everything in one spread.',
    wide: true,
  },
  {
    src: '/gallery/04.jpg',
    alt: 'Brown vegetarian curry in a bowl',
    caption: 'Rich, slow and deeply comforting.',
    tall: true,
  },
  {
    src: '/gallery/12.jpg',
    alt: 'Pav bhaji with buttered buns',
    caption: 'Mumbai comfort on a plate.',
  },
  {
    src: '/gallery/17.jpg',
    alt: 'Chilli paneer bites on a plate',
    caption: 'Wok heat and Indo-Chinese spice.',
  },
  {
    src: '/gallery/16.jpg',
    alt: 'Chaat platter with yoghurt and chutney',
    caption: 'Street flavours, shared.',
  },
  {
    src: '/gallery/35.jpg',
    alt: 'Pani puri ready to eat',
    caption: 'One bite, full flavour.',
  },
  {
    src: '/gallery/38.jpg',
    alt: 'Plated samosas with chutney',
    caption: 'Crisp parcels to share.',
  },
  {
    src: '/gallery/21.jpg',
    alt: 'Dal with fresh naan',
    caption: 'From the tandoor to the table.',
  },
  {
    src: '/gallery/31.jpg',
    alt: 'Basket of fresh naan bread',
    caption: 'Fresh from the tandoor.',
    tall: true,
  },
  {
    src: '/gallery/24.jpg',
    alt: 'Uttapam cooking on the griddle',
    caption: 'Fresh from the pan.',
  },
  {
    src: '/gallery/57.jpg',
    alt: 'Vegetable pulao rice',
    caption: 'Fragrant basmati.',
  },
  {
    src: '/gallery/27.jpg',
    alt: 'Mint and lime cooler in a glass',
    caption: 'Something cold and refreshing.',
  },
  {
    src: '/gallery/43.jpg',
    alt: 'Rose-flavoured drink in a glass',
    caption: 'Something floral at the bar.',
  },
  {
    src: '/gallery/62.jpg',
    alt: 'Layered cocktail with fruit in a faceted glass',
    caption: 'Something cold and celebratory.',
    tall: true,
  },
];

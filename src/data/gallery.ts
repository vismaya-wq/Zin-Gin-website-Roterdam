export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  /** Wider tile on desktop */
  wide?: boolean;
  /** Taller tile on desktop */
  tall?: boolean;
};

/** 62 photos — synced from assets via scripts/sync-gallery-from-assets.mjs */
export const GALLERY: GalleryItem[] = [
  {
    src: '/gallery/01.jpg',
    alt: 'Curry with garlic naan on the side',
    caption: 'Slow curry, warm bread.',
  },
  {
    src: '/gallery/02.jpg',
    alt: 'Vegetable biryani in a serving bowl',
    caption: 'Fragrant rice, layered spice.',
  },
  {
    src: '/gallery/03.jpg',
    alt: 'South Indian breakfast combo on one plate',
    caption: 'A proper morning spread.',
    wide: true,
  },
  {
    src: '/gallery/04.jpg',
    alt: 'Brown vegetarian curry in a bowl',
    caption: 'Rich, slow and deeply comforting.',
    tall: true,
  },
  {
    src: '/gallery/05.jpg',
    alt: 'Brown vegetarian curry in a bowl',
    caption: 'Rich, slow and deeply comforting.',
  },
  {
    src: '/gallery/06.jpg',
    alt: 'Bhel puri with sev and chutney',
    caption: 'Crunchy, tangy street food.',
    tall: true,
  },
  {
    src: '/gallery/07.jpg',
    alt: 'Dal and rice with pickle',
    caption: 'Homely and satisfying.',
  },
  {
    src: '/gallery/08.jpg',
    alt: 'Crisp dosa with chutneys',
    caption: 'Made for dipping.',
  },
  {
    src: '/gallery/09.jpg',
    alt: 'Indian milk dessert in a bowl',
    caption: 'A sweet ending.',
  },
  {
    src: '/gallery/10.jpg',
    alt: 'Steamed momos with dip',
    caption: 'Soft parcels, bold dip.',
  },
  {
    src: '/gallery/11.jpg',
    alt: 'Onion uttapam from the griddle',
    caption: 'Crisp edges, soft centre.',
    wide: true,
  },
  {
    src: '/gallery/12.jpg',
    alt: 'Pav bhaji with buttered buns',
    caption: 'Mumbai comfort on a plate.',
  },
  {
    src: '/gallery/13.jpg',
    alt: 'Cool raita with fresh herbs',
    caption: 'The perfect side.',
    tall: true,
  },
  {
    src: '/gallery/14.jpg',
    alt: 'Savory lentil balls with chutney',
    caption: 'Small bites, big flavour.',
  },
  {
    src: '/gallery/15.jpg',
    alt: 'Chaat served in a bowl',
    caption: 'Bright, tangy, impossible to stop.',
  },
  {
    src: '/gallery/16.jpg',
    alt: 'Chaat platter with yoghurt and chutney',
    caption: 'Street flavours, shared.',
  },
  {
    src: '/gallery/17.jpg',
    alt: 'Chilli paneer bites on a plate',
    caption: 'Wok heat and Indo-Chinese spice.',
  },
  {
    src: '/gallery/18.jpg',
    alt: 'Chole bhature with fluffy bread',
    caption: 'Weekend breakfast energy.',
  },
  {
    src: '/gallery/19.jpg',
    alt: 'Cone dosa with fillings',
    caption: 'Crisp, fun and made to share.',
    tall: true,
  },
  {
    src: '/gallery/20.jpg',
    alt: 'Dahi puri with cool yoghurt',
    caption: 'Sweet, sour and crunchy.',
    wide: true,
  },
  {
    src: '/gallery/21.jpg',
    alt: 'Dal with fresh naan',
    caption: 'From the tandoor to the table.',
  },
  {
    src: '/gallery/22.jpg',
    alt: 'Filled bun with spiced stuffing',
    caption: 'Grab-and-go comfort.',
    wide: true,
    tall: true,
  },
  {
    src: '/gallery/23.jpg',
    alt: 'Fruit custard in a glass',
    caption: 'Something cool and sweet.',
  },
  {
    src: '/gallery/24.jpg',
    alt: 'Uttapam cooking on the griddle',
    caption: 'Fresh from the pan.',
  },
  {
    src: '/gallery/25.jpg',
    alt: 'Gulab jamun in syrup',
    caption: 'Warm and indulgent.',
  },
  {
    src: '/gallery/26.jpg',
    alt: 'Idli with sambar and chutney',
    caption: 'Steamed, light and classic.',
  },
  {
    src: '/gallery/27.jpg',
    alt: 'Mint and lime cooler in a glass',
    caption: 'Something cold and refreshing.',
  },
  {
    src: '/gallery/28.jpg',
    alt: 'Misal pav with spicy usal',
    caption: 'Pune-style heat and crunch.',
  },
  {
    src: '/gallery/29.jpg',
    alt: 'Misal with vada on the side',
    caption: 'A hearty Maharashtrian plate.',
  },
  {
    src: '/gallery/30.jpg',
    alt: 'Mixed vegetable curry',
    caption: 'Colour on the plate.',
  },
  {
    src: '/gallery/31.jpg',
    alt: 'Basket of fresh naan bread',
    caption: 'Fresh from the tandoor.',
    tall: true,
  },
  {
    src: '/gallery/32.jpg',
    alt: 'Orange-hued vegetable curry',
    caption: 'Creamy tomato warmth.',
    tall: true,
  },
  {
    src: '/gallery/33.jpg',
    alt: 'Orange-hued vegetable curry',
    caption: 'Creamy tomato warmth.',
    wide: true,
  },
  {
    src: '/gallery/34.jpg',
    alt: 'Orange-tinted Indian dessert',
    caption: 'Finish with something sweet.',
  },
  {
    src: '/gallery/35.jpg',
    alt: 'Pani puri ready to eat',
    caption: 'One bite, full flavour.',
  },
  {
    src: '/gallery/36.jpg',
    alt: 'Golden patties on a platter',
    caption: 'Hot from the counter.',
  },
  {
    src: '/gallery/37.jpg',
    alt: 'Plated orange curry with rice',
    caption: 'Dinner that runs long.',
    wide: true,
  },
  {
    src: '/gallery/38.jpg',
    alt: 'Plated samosas with chutney',
    caption: 'Crisp parcels to share.',
  },
  {
    src: '/gallery/39.jpg',
    alt: 'Yellow curry on a white plate',
    caption: 'Sunshine on the plate.',
  },
  {
    src: '/gallery/40.jpg',
    alt: 'Puri chaat pair on a plate',
    caption: 'Tangy street classics.',
    tall: true,
  },
  {
    src: '/gallery/41.jpg',
    alt: 'Rice with chilli paneer combo',
    caption: 'Heat meets comfort.',
  },
  {
    src: '/gallery/42.jpg',
    alt: 'Rice combo thali-style meal',
    caption: 'Everything in one spread.',
  },
  {
    src: '/gallery/43.jpg',
    alt: 'Rose-flavoured drink in a glass',
    caption: 'Something floral at the bar.',
  },
  {
    src: '/gallery/44.jpg',
    alt: 'Fresh salad and sides platter',
    caption: 'Bright crunch between courses.',
    wide: true,
  },
  {
    src: '/gallery/45.jpg',
    alt: 'Fresh salad and sides platter',
    caption: 'Bright crunch between courses.',
    tall: true,
  },
  {
    src: '/gallery/46.jpg',
    alt: 'Golden samosas with chutney',
    caption: 'Samosas, ready for the table.',
  },
  {
    src: '/gallery/47.jpg',
    alt: 'Golden samosas with chutney',
    caption: 'Samosas, ready for the table.',
  },
  {
    src: '/gallery/48.jpg',
    alt: 'Saucy Indo-Chinese noodles',
    caption: 'Wok-tossed and bold.',
  },
  {
    src: '/gallery/49.jpg',
    alt: 'Savory fritters with dip',
    caption: 'Crisp outside, soft within.',
    tall: true,
  },
  {
    src: '/gallery/50.jpg',
    alt: 'Aloo tikki chaat with chutneys',
    caption: 'Street food at its best.',
  },
  {
    src: '/gallery/51.jpg',
    alt: 'Triangle-cut masala dosa',
    caption: 'Crisp dosa, spiced potato.',
  },
  {
    src: '/gallery/52.jpg',
    alt: 'Medu vada with chutney',
    caption: 'Crisp lentil doughnuts.',
  },
  {
    src: '/gallery/53.jpg',
    alt: 'Vada pav in a soft bun',
    caption: 'Mumbai on a plate.',
  },
  {
    src: '/gallery/54.jpg',
    alt: 'Seasonal vegetable dish',
    caption: 'Honest, vegetarian cooking.',
    wide: true,
  },
  {
    src: '/gallery/55.jpg',
    alt: 'Seasonal vegetable dish',
    caption: 'Honest, vegetarian cooking.',
    wide: true,
  },
  {
    src: '/gallery/56.jpg',
    alt: 'Vegetable noodles stir-fry',
    caption: 'Indo-Chinese comfort.',
  },
  {
    src: '/gallery/57.jpg',
    alt: 'Vegetable pulao rice',
    caption: 'Fragrant basmati.',
  },
  {
    src: '/gallery/58.jpg',
    alt: 'Vegetable pulao rice',
    caption: 'Fragrant basmati.',
    tall: true,
  },
  {
    src: '/gallery/59.jpg',
    alt: 'Curry served in a white bowl',
    caption: 'Slow-cooked comfort.',
  },
  {
    src: '/gallery/60.jpg',
    alt: 'Yoghurt-based raita or chaat base',
    caption: 'Cool against the spice.',
  },
  {
    src: '/gallery/61.jpg',
    alt: 'Yoghurt-based raita or chaat base',
    caption: 'Cool against the spice.',
  },
  {
    src: '/gallery/62.jpg',
    alt: 'Layered cocktail with fruit in a faceted glass',
    caption: 'Something cold and celebratory.',
    tall: true,
  },
];

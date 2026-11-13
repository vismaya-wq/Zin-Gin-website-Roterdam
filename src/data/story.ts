export type StoryChapter = {
  id: string;
  label: string;
  title: string;
  lead: string;
  body: string;
  image: string;
  imageAlt: string;
};

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'dining',
    label: 'Dining',
    title: 'Vegetarian Indian dining in Rotterdam Noord.',
    lead: 'Warm light, a colourful mural, and tables that invite you to stay.',
    body:
      'Whether you are meeting friends, celebrating quietly, or sharing plates across the table — the dining room is where Zin meets Gin: vegetarian Indian food from the kitchen, botanical drinks from the bar, conversation in between.',
    image: '/gallery/42.jpg',
    imageAlt: 'Rice combo thali-style meal spread at Zin & Gin',
  },
  {
    id: 'kitchen',
    label: 'The kitchen',
    title: '100% vegetarian Indian cooking — bold, familiar, Rotterdam-ready.',
    lead: 'Bold spices, familiar favourites, and plates worth lingering over.',
    body:
      'South Indian breakfasts, Indo-Chinese comfort, slow curries and breads from the tawa. Everything on the menu is vegetarian Indian — the bar is where Gin earns its place in the name.',
    image: '/gallery/04.jpg',
    imageAlt: 'Brown vegetarian curry in a bowl',
  },
  {
    id: 'breakfast',
    label: 'Breakfast',
    title: 'Mornings with dosa, vada and a full buffet.',
    lead: 'Weekday service from 07:30. Weekends run a little later.',
    body:
      'Hotel guests and walk-ins share the same counter — uttapam, idli, continental touches and strong coffee. It is the calm before the city fully wakes up.',
    image: '/gallery/03.jpg',
    imageAlt: 'South Indian breakfast combo on one plate',
  },
  {
    id: 'evening',
    label: 'Evenings',
    title: 'Dinner that tends to run long.',
    lead: 'Every evening, 17:00 – 21:30 — relaxed tables and a warm room.',
    body:
      'Sharing plates, biryani nights, a drink at the bar, reservations that turn into “just one more chai.” The room softens as the mural glows.',
    image: '/gallery/43.jpg',
    imageAlt: 'Rose-flavoured drink in a glass at the bar',
  },
];

export const STORY_VALUES = [
  {
    id: 'veg',
    title: '100% vegetarian',
    detail: 'No meat on the pass — ever. Fish and eggs stay off the menu too.',
  },
  {
    id: 'honest',
    title: 'Honest hospitality',
    detail: 'All guests get the same welcome and the same kitchen.',
  },
  {
    id: 'craft',
    title: 'Craft over trends',
    detail: 'Recipes that respect tradition, with room for Rotterdam energy.',
  },
] as const;

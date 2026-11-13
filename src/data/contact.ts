/** Contact page FAQ — client-approved copy (final correction round). */
export type ContactFaqItem = {
  id: string;
  q: string;
  /** Plain answer; use `afterCta` for links below the paragraph when needed. */
  a: string;
  afterCta?: 'reserve' | 'instagram';
};

export const CONTACT_FAQ: ContactFaqItem[] = [
  {
    id: 'find',
    q: 'How do I find the restaurant?',
    a:
      'We are located right inside the lobby of Hotel Teleport at Schiekade 730, Rotterdam. Just walk right through the main hotel entrance and you will find us.',
  },
  {
    id: 'urban-tapri',
    q: 'Are you the same restaurant as Urban Tapri?',
    a:
      'Yes! Zin & Gin operates under the exact same management. We offer the same authentic taste and beloved street food, just in a new, elevated dine-in space.',
  },
  {
    id: 'meat',
    q: 'Do you serve meat?',
    a:
      'No, Zin & Gin is a 100% vegetarian Indian gastrobar. We also offer many vegan-friendly options.',
  },
  {
    id: 'reservation',
    q: 'Do I need to make a reservation, or can I just walk in?',
    a:
      'Walk-ins are always welcome via the hotel lobby. However, to guarantee a table for our evening dinner service or for special holiday set menus, we highly recommend booking in advance.',
    afterCta: 'reserve',
  },
  {
    id: 'allergies',
    q: 'Do you cater to severe allergies?',
    a:
      'Yes, we clearly mark our menu for Veg, Vegan, Gluten, Nuts, and Spice levels. Please inform our staff of any allergies when you arrive or leave a note in your reservation.',
  },
  {
    id: 'events',
    q: 'Do you host live music, private parties, events, and catering (both at your venue and outside)?',
    a:
      'Yes, we do all of it! We can accommodate private parties, gatherings, and events for up to 150 people at our location. We also offer dedicated catering services for external corporate and private events.',
    afterCta: 'instagram',
  },
];

import { IMAGES } from './images';
import type { EventRecord } from './ops';

/** Starter events. Staff replace these from the admin desk — they are not hardcoded into the page. */
export const EVENT_SEED: Omit<EventRecord, 'createdAt'>[] = [
  {
    id: 'friday-live',
    name: 'Friday Night Live',
    date: '2026-11-06',
    image: IMAGES.interiorWarm,
    description:
      'An evening of live music, Indian favourites and relaxed drinks at Zin & Gin. Join us for dinner and stay for the set — tables fill up on Fridays, so reserve ahead.',
    ctaLabel: 'Reserve',
    ctaHref: '/reserve',
    status: 'published',
  },
  {
    id: 'catering',
    name: 'We cook for the party',
    date: '2026-12-01',
    image: IMAGES.thaliWarm,
    description:
      'Baby showers, birthdays, office lunches and private gatherings. Tell us your date and headcount — we shape a vegetarian menu with you and handle the kitchen on the night.',
    ctaLabel: 'Enquire',
    ctaHref: 'mailto:zinandgin@gmail.com',
    status: 'published',
  },
  {
    id: 'sunday-thali',
    name: 'Sunday Thali',
    date: '2026-11-15',
    image: IMAGES.thaliSteel,
    description: 'A changing vegetarian thali, served while it lasts.',
    ctaLabel: 'View event',
    ctaHref: '/reserve',
    status: 'draft',
  },
];

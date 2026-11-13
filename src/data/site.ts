/**
 * Venue details. Swap phone, social and Uber Eats for the live client links.
 * Uber Eats must be the official store URL (PUBLIC_UBER_EATS_URL), never a search page.
 */
const uberFromEnv = (import.meta.env.PUBLIC_UBER_EATS_URL || '').trim();
const posFromEnv = (import.meta.env.PUBLIC_POS_ORDER_URL || '').trim();
const UBER_STORE =
  'https://www.ubereats.com/store-browse-uuid/1ac33f18-f3fa-52e4-81f3-97f2ada778c0?diningMode=DELIVERY';
/** BonAppio online menu / POS — override with PUBLIC_POS_ORDER_URL if the slug changes. */
const POS_ORDER_URL = 'https://app.bonappio.com/menu/zin-&-gin';

export const SITE = {
  name: 'Zin & Gin',
  tagline: 'Vegetarian Restaurant & Bar',
  street: 'Schiekade 730',
  postcode: '3032 AL',
  city: 'Rotterdam',
  venue: 'Inside Teleport Hotel',
  phone: '+31 6 23 95 39 51',
  phoneHref: 'tel:+31623953951',
  email: 'zinandgin@gmail.com',
  instagram: 'https://www.instagram.com/zinandgin/',
  instagramHandle: '@zinandgin',
  facebook: '',
  whatsapp: 'https://wa.me/31623953951',
  whatsappEvents:
    'https://wa.me/31623953951?text=' +
    encodeURIComponent("Hi Zin & Gin, I'm interested in enquiring about an event or catering. Could you share more details?"),
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Zin+%26+Gin,+Schiekade+730,+3032+AL+Rotterdam,+Netherlands',
  reviewsUrl:
    'https://www.google.com/maps/place/Zin+%26+Gin+%7C+Indian+Restaurant+%26+Bar/@51.9285129,4.4741243,17z/data=!4m8!3m7!1s0x47c435005469aa83:0xc74676b9dafa9c49!8m2!3d51.9285129!4d4.4741243!9m1!1b1!16s%2Fg%2F11ykxjd58b',
  uberEatsUrl: uberFromEnv || UBER_STORE,
  posOrderUrl: posFromEnv || POS_ORDER_URL,
  dinnerHours: [{ days: 'Monday – Sunday', time: '17:00 – 21:30' }],
  breakfastHours: [
    { days: 'Monday – Friday', time: '07:30 – 10:00' },
    { days: 'Saturday – Sunday', time: '08:00 – 10:30' },
  ],
  rating: 4.8,
  reviewCount: '100+',
  urbanTapri: 'From the people behind Urban Tapri',
} as const;

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
] as const;

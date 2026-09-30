/**
 * Venue details. Phone, hours, Instagram and Uber Eats URL are placeholders
 * until confirmed by the client.
 */
export const SITE = {
  name: 'Zin & Gin',
  tagline: 'Vegetarian Indian Restaurant & Bar',
  street: 'Schiekade 730',
  postcode: '3032 AL',
  city: 'Rotterdam',
  venue: 'Inside Teleport Hotel',
  phone: '+31 10 000 00 00',
  phoneHref: 'tel:+31100000000',
  email: 'hello@zinandgin.nl',
  instagram: 'https://www.instagram.com/',
  instagramHandle: '@zinandgin.rotterdam',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zin+%26+Gin+Schiekade+730+3032+AL+Rotterdam',
  reviewsUrl: 'https://www.google.com/maps/search/?api=1&query=Zin+%26+Gin+Rotterdam+reviews',
  uberEatsUrl: 'https://www.ubereats.com/nl/search?q=Zin%20%26%20Gin%20Rotterdam',
  hours: [
    { days: 'Mon – Thu', time: '17:00 – 22:30' },
    { days: 'Fri – Sat', time: '17:00 – 23:00' },
    { days: 'Sunday', time: '12:00 – 22:00' },
  ],
  rating: 4.8,
  reviewCount: '100+',
} as const;

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Our Story', href: '/#story' },
  { label: 'Gallery', href: '/#kitchen' },
  { label: 'Contact', href: '#contact' },
] as const;

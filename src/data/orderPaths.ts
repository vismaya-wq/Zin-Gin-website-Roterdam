/** Customer journeys. Food ordering never builds a cart on this site. */
export const PATHS = {
  reserve: '/reserve',
  order: '/order',
  menu: '/menu',
  menuPdf: '/api/menu-pdf',
  admin: '/admin',
} as const;

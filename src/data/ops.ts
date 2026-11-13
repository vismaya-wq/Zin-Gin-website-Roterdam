import type { DiningSession, SeatingId } from './hotel';
import type { CategoryId, DietaryTag } from './menu';

export type Role = 'owner' | 'manager' | 'worker';
export type LegacyStaffRole = 'admin' | 'manager' | 'staff';
export type BookingStatus = 'pending' | 'confirmed' | 'alternative_suggested' | 'declined' | 'cancelled';

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  guests: number;
  roomNumber: string;
  date: string;
  diningSession: DiningSession;
  time: string;
  seating: SeatingId;
  remarks: string;
  status: BookingStatus;
  createdAt: string;
  confirmedBy: string;
  confirmedAt: string;
  internalNote: string;
  alternativeTime: string;
  alternativeSeating: string;
}

export interface MenuRecord {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  price: number;
  tags: DietaryTag[];
  image?: string;
  sortOrder: number;
  available: boolean;
  featured: boolean;
}

export interface EventRecord {
  id: string;
  name: string;
  date: string;
  image: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  status: 'published' | 'draft';
  createdAt: string;
}

export interface NotificationIntent {
  id: string;
  reservationId: string;
  channel: 'email' | 'whatsapp';
  /** Prepared for a future provider. Nothing is sent until one is configured. */
  status: 'prepared';
  provider: 'unconfigured';
  to: string;
  subject?: string;
  body: string;
  createdAt: string;
}

export interface PublicStaff {
  id: string;
  name: string;
  email: string;
  role: LegacyStaffRole;
  active: boolean;
}

export interface GalleryRecord {
  id: string;
  src: string;
  alt: string;
  caption: string;
  wide?: boolean;
  tall?: boolean;
  sortOrder: number;
  visible?: boolean;
}

export interface BookGroup {
  id: string;
  label: string;
  items: MenuRecord[];
}

export interface BookPage {
  id: string;
  title: string;
  kicker: string;
  image?: string;
  groups: BookGroup[];
}

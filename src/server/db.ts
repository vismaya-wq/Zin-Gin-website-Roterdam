import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { CATEGORIES, MENU, type DietaryTag } from '../data/menu';
import { EVENT_SEED } from '../data/events';
import { GALLERY } from '../data/gallery';
import {
  BREAKFAST_SLOTS,
  DINNER_SLOTS,
  SEATING_PREFERENCES,
  slotsForSession,
  type DiningSession,
  type SeatingId,
} from '../data/hotel';
import type {
  BookPage,
  EventRecord,
  GalleryRecord,
  MenuRecord,
  NotificationIntent,
  PublicStaff,
  Reservation,
  LegacyStaffRole,
} from '../data/ops';
import { confirmationIntents } from './notify';

interface StaffUser extends PublicStaff {
  salt: string;
  passwordHash: string;
}

interface DB {
  users: StaffUser[];
  reservations: Reservation[];
  menu: MenuRecord[];
  events: EventRecord[];
  gallery: GalleryRecord[];
  notifications: NotificationIntent[];
}

const ITEMS_PER_MENU_SHEET = 7;
const ALL_SLOTS = [...BREAKFAST_SLOTS, ...DINNER_SLOTS];

const DIR =
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join('/tmp', 'zin-gin')
    : path.join(process.cwd(), 'data', 'runtime');
const FILE = path.join(DIR, 'db.json');
const UPLOADS = path.join(DIR, 'uploads');
let memory: DB | null = null;

const TAGS = new Set<DietaryTag>(['VEG', 'VEGAN', 'GF', 'NUTS', 'SPICY']);
const ROLES = new Set<LegacyStaffRole>(['admin', 'manager', 'staff']);

let chain: Promise<unknown> = Promise.resolve();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const passwordHash = scryptSync(password, salt, 32).toString('hex');
  return { salt, passwordHash };
}

export function verifyPassword(password: string, salt: string, passwordHash: string) {
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(passwordHash, 'hex');
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function seedMenu(): MenuRecord[] {
  return MENU.map((item, index) => ({
    id: item.id,
    category: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    tags: item.tags,
    image: item.image,
    sortOrder: index,
    available: item.available ?? true,
    featured: item.featured ?? Boolean(item.popular),
  }));
}

function seedEvents(): EventRecord[] {
  const now = new Date().toISOString();
  return EVENT_SEED.map((event) => ({ ...event, createdAt: now }));
}

function seedGallery(): GalleryRecord[] {
  return GALLERY.map((item, index) => ({
    id: `gal-${String(index + 1).padStart(2, '0')}`,
    src: item.src,
    alt: item.alt,
    caption: item.caption,
    wide: item.wide,
    tall: item.tall,
    sortOrder: index,
  }));
}

function seedUsers(): StaffUser[] {
  const password = process.env.STAFF_BOOTSTRAP_PASSWORD || 'Teleport730!';
  const people: { id: string; name: string; email: string; role: LegacyStaffRole }[] = [
    { id: 'user-admin', name: 'Restaurant Admin', email: 'admin@zinandgin.nl', role: 'admin' },
    { id: 'user-manager', name: 'Floor Manager', email: 'manager@zinandgin.nl', role: 'manager' },
    { id: 'user-staff', name: 'Service Team', email: 'staff@zinandgin.nl', role: 'staff' },
  ];
  return people.map((person) => ({ ...person, active: true, ...hashPassword(password) }));
}

function empty(): DB {
  return {
    users: seedUsers(),
    reservations: [],
    menu: seedMenu(),
    events: seedEvents(),
    gallery: seedGallery(),
    notifications: [],
  };
}

function read(): DB {
  if (memory) return memory;
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const parsed = JSON.parse(raw) as DB;
    if (!parsed.users?.length || !parsed.menu || !parsed.events || !parsed.reservations || !parsed.notifications) {
      const db = empty();
      write(db);
      return db;
    }
    const gallerySeed = seedGallery();
    const galleryStale =
      !parsed.gallery?.length ||
      parsed.gallery.length !== gallerySeed.length ||
      parsed.gallery[0]?.src !== gallerySeed[0]?.src;
    if (galleryStale) parsed.gallery = gallerySeed;
    const shouldPersistGallery = galleryStale;
    for (const event of parsed.events) {
      const seed = EVENT_SEED.find((row) => row.id === event.id);
      if (seed && seed.description.length > (event.description?.length ?? 0)) {
        event.description = seed.description;
      }
    }
    parsed.reservations = parsed.reservations.map((row) => ({
      ...row,
      diningSession: row.diningSession === 'breakfast' ? 'breakfast' : 'dinner',
    }));
    memory = parsed as DB;
    if (shouldPersistGallery) write(memory);
    return memory;
  } catch {
    const db = empty();
    write(db);
    return db;
  }
}

function write(db: DB) {
  memory = db;
  try {
    fs.mkdirSync(DIR, { recursive: true });
    const tmp = `${FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
    fs.renameSync(tmp, FILE);
  } catch {
    // Serverless hosts keep the copy in memory when the disk is read-only.
  }
}

function update<T>(fn: (db: DB) => T): Promise<T> {
  const run = chain.then(() => {
    const db = read();
    const result = fn(db);
    write(db);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay();
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function id(prefix: string) {
  return `${prefix}-${randomBytes(3).toString('hex')}`;
}

export function publicStaff(user: StaffUser): PublicStaff {
  return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active };
}

export function findUserByEmail(email: string) {
  const db = read();
  return db.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.active) ?? null;
}

export function listStaff() {
  return read().users.filter((user) => user.active).map(publicStaff);
}

export function staffName(staffId: string) {
  return read().users.find((user) => user.id === staffId)?.name ?? '';
}

export async function createStaff(input: { name: string; email: string; role: LegacyStaffRole; password: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email.includes('@') || input.password.length < 8 || !ROLES.has(input.role)) {
    return { error: 'Name, a valid email, a role and a password of at least 8 characters are required.' };
  }
  return update((db) => {
    if (db.users.some((user) => user.email === email)) return { error: 'That email already has access.' };
    const user: StaffUser = { id: id('user'), name, email, role: input.role, active: true, ...hashPassword(input.password) };
    db.users.push(user);
    return { user: publicStaff(user) };
  });
}

const hits = new Map<string, number[]>();

export function allowReservation(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((stamp) => now - stamp < 60 * 60 * 1000);
  if (recent.length >= 8) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export interface ReservationInput {
  name?: string;
  phone?: string;
  email?: string;
  guests?: number;
  roomNumber?: string;
  date?: string;
  diningSession?: string;
  time?: string;
  seating?: string;
  remarks?: string;
  company?: string;
}

export async function createReservation(input: ReservationInput) {
  if (input.company) return { ok: true as const, reservation: null };
  const name = (input.name || '').trim();
  const phone = (input.phone || '').trim();
  const email = (input.email || '').trim();
  const roomNumber = (input.roomNumber || '').trim();
  const date = (input.date || '').trim();
  const time = (input.time || '').trim();
  const remarks = (input.remarks || '').trim();
  const guests = Number(input.guests);
  const seating = input.seating as SeatingId;

  if (name.length < 2 || name.length > 80) return { error: 'Add the name for the booking.' };
  if (phone.length < 6 || phone.length > 24) return { error: 'Add a phone number we can reach you on.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Add a valid email address.' };
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) return { error: 'Tell us how many guests, from 1 to 20.' };
  if (roomNumber.length > 16) return { error: 'Room number looks too long.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Choose a date.' };
  if (date < todayISO()) return { error: 'That date has already passed.' };
  const diningSession: DiningSession = input.diningSession === 'breakfast' ? 'breakfast' : 'dinner';
  const allowed = slotsForSession(diningSession);
  const timeOk =
    diningSession === 'breakfast'
      ? (weekday(date) === 0 || weekday(date) === 6
          ? time >= '08:00' && time <= '10:30'
          : time >= '07:30' && time <= '10:00') && (allowed as readonly string[]).includes(time)
      : (allowed as readonly string[]).includes(time);
  if (!timeOk) return { error: 'Choose one of the available times.' };
  if (!SEATING_PREFERENCES.some((item) => item.id === seating)) return { error: 'Choose a seating preference.' };
  if (remarks.length > 500) return { error: 'Keep the note under 500 characters.' };

  const reservation: Reservation = {
    id: `ZG-${randomBytes(3).toString('hex').toUpperCase()}`,
    name,
    phone,
    email,
    guests,
    roomNumber,
    date,
    diningSession,
    time,
    seating,
    remarks,
    status: 'pending',
    createdAt: new Date().toISOString(),
    confirmedBy: '',
    confirmedAt: '',
    internalNote: '',
    alternativeTime: '',
    alternativeSeating: '',
  };

  await update((db) => {
    db.reservations.unshift(reservation);
  });
  return { ok: true as const, reservation };
}

export function listReservations() {
  const db = read();
  return db.reservations.map((reservation) => ({
    ...reservation,
    notifications: db.notifications.filter((item) => item.reservationId === reservation.id),
  }));
}

export async function actOnReservation(
  reservationId: string,
  actor: { id: string; name: string },
  action: string,
  extra: { time?: string; seating?: string; note?: string; staffId?: string },
) {
  return update((db) => {
    const reservation = db.reservations.find((item) => item.id === reservationId);
    if (!reservation) return { error: 'Booking not found.' };
    const now = new Date().toISOString();

    if (action === 'confirm') {
      reservation.status = 'confirmed';
      reservation.confirmedBy = actor.name;
      reservation.confirmedAt = now;
      db.notifications = db.notifications.filter((item) => item.reservationId !== reservation.id);
      db.notifications.push(...confirmationIntents(reservation, now));
    } else if (action === 'decline') {
      reservation.status = 'declined';
    } else if (action === 'cancel') {
      reservation.status = 'cancelled';
    } else if (action === 'note') {
      reservation.internalNote = (extra.note || '').trim().slice(0, 800);
    } else if (action === 'suggest-time') {
      if (!(ALL_SLOTS as readonly string[]).includes(extra.time || '')) return { error: 'Choose a dining time.' };
      reservation.status = 'alternative_suggested';
      reservation.alternativeTime = extra.time || '';
    } else if (action === 'suggest-seating') {
      if (!SEATING_PREFERENCES.some((item) => item.id === extra.seating)) return { error: 'Choose a seating option.' };
      reservation.status = 'alternative_suggested';
      reservation.alternativeSeating = extra.seating || '';
    } else {
      return { error: 'Unknown action.' };
    }
    return { reservation };
  });
}

export function bookFromMenu(items: MenuRecord[]): BookPage[] {
  const visible = items.filter((item) => item.available).sort((a, b) => a.sortOrder - b.sortOrder);
  const pages: BookPage[] = [];
  for (const category of CATEGORIES.filter((entry) => entry.id !== 'popular')) {
    const catItems = visible.filter((item) => item.category === category.id);
    for (let offset = 0; offset < catItems.length; offset += ITEMS_PER_MENU_SHEET) {
      const chunk = catItems.slice(offset, offset + ITEMS_PER_MENU_SHEET);
      pages.push({
        id: `${category.id}-${offset}`,
        kicker: 'The menu',
        title: offset === 0 ? category.label : `${category.label} · continued`,
        groups: [{ id: category.id, label: category.label, items: chunk }],
      });
    }
  }
  if (!pages.length) {
    return [{ id: 'empty', kicker: 'Zin & Gin', title: 'Menu', groups: [] }];
  }
  return pages;
}

export function getGalleryRecords() {
  return [...read().gallery].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveGalleryItem(input: Partial<GalleryRecord> & { src?: string }, existingId?: string) {
  const caption = (input.caption ?? '').trim();
  return update((db) => {
    if (existingId) {
      const item = db.gallery.find((row) => row.id === existingId);
      if (!item) return { error: 'Image not found.' };
      const src = (input.src || '').trim();
      if (src) item.src = src;
      item.caption = caption;
      item.alt = caption || item.alt || 'Gallery photograph';
      return { item };
    }
    const src = (input.src || '').trim();
    if (!src) return { error: 'Upload an image.' };
    const item: GalleryRecord = {
      id: id('gal'),
      src,
      alt: caption || 'Gallery photograph',
      caption,
      wide: false,
      tall: false,
      sortOrder: db.gallery.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 1,
    };
    db.gallery.push(item);
    return { item };
  });
}

export async function reorderGalleryItem(itemId: string, direction: 'up' | 'down') {
  return update((db) => {
    const sorted = [...db.gallery].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((row) => row.id === itemId);
    const swap = sorted[index + (direction === 'up' ? -1 : 1)];
    if (!swap) return { ok: true };
    const order = sorted[index].sortOrder;
    sorted[index].sortOrder = swap.sortOrder;
    swap.sortOrder = order;
    return { ok: true };
  });
}

export async function deleteGalleryItem(itemId: string) {
  return update((db) => {
    db.gallery = db.gallery.filter((row) => row.id !== itemId);
    return { ok: true };
  });
}

export function getPublicBook() {
  return bookFromMenu(read().menu);
}

export function getMenuRecords() {
  return [...read().menu].sort((a, b) => a.sortOrder - b.sortOrder);
}

function cleanTags(tags: unknown): DietaryTag[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag): tag is DietaryTag => typeof tag === 'string' && TAGS.has(tag as DietaryTag));
}

function categoryOk(value: string) {
  return CATEGORIES.some((category) => category.id === value && category.id !== 'popular');
}

export async function saveMenuItem(input: Partial<MenuRecord> & { name?: string }, existingId?: string) {
  const name = (input.name || '').trim();
  const category = (input.category || '') as MenuRecord['category'];
  const price = Number(input.price);
  if (name.length < 2) return { error: 'Add a dish name.' };
  if (!categoryOk(category)) return { error: 'Choose a category.' };
  if (!Number.isFinite(price) || price < 0 || price > 500) return { error: 'Add a price.' };

  return update((db) => {
    if (existingId) {
      const item = db.menu.find((dish) => dish.id === existingId);
      if (!item) return { error: 'Dish not found.' };
      item.name = name;
      item.category = category;
      item.description = (input.description || '').trim().slice(0, 280);
      item.price = Math.round(price * 100) / 100;
      item.tags = cleanTags(input.tags);
      item.available = input.available !== false;
      item.featured = Boolean(input.featured);
      if (Number.isFinite(input.sortOrder)) item.sortOrder = Number(input.sortOrder);
      if (typeof input.image === 'string') item.image = input.image;
      return { item };
    }
    const item: MenuRecord = {
      id: id('dish'),
      name,
      category,
      description: (input.description || '').trim().slice(0, 280),
      price: Math.round(price * 100) / 100,
      tags: cleanTags(input.tags),
      image: input.image,
      sortOrder: Number.isFinite(input.sortOrder)
        ? Number(input.sortOrder)
        : db.menu.reduce((max, dish) => Math.max(max, dish.sortOrder), 0) + 1,
      available: input.available !== false,
      featured: Boolean(input.featured),
    };
    db.menu.push(item);
    return { item };
  });
}

export async function reorderMenuItem(itemId: string, direction: 'up' | 'down') {
  return update((db) => {
    const item = db.menu.find((dish) => dish.id === itemId);
    if (!item) return { error: 'Dish not found.' };
    const siblings = db.menu
      .filter((dish) => dish.category === item.category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const index = siblings.findIndex((dish) => dish.id === item.id);
    const swapWith = siblings[index + (direction === 'up' ? -1 : 1)];
    if (!swapWith) return { ok: true };
    const order = item.sortOrder;
    item.sortOrder = swapWith.sortOrder;
    swapWith.sortOrder = order;
    return { ok: true };
  });
}

export async function deleteMenuItem(itemId: string) {
  return update((db) => {
    const before = db.menu.length;
    db.menu = db.menu.filter((dish) => dish.id !== itemId);
    if (db.menu.length === before) return { error: 'Dish not found.' };
    return { ok: true };
  });
}

export function listEvents(includeDrafts: boolean) {
  return read()
    .events.filter((event) => includeDrafts || event.status === 'published')
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveEvent(input: Partial<EventRecord>, existingId?: string) {
  const name = (input.name || '').trim();
  const date = (input.date || '').trim();
  const description = (input.description || '').trim();
  if (name.length < 2) return { error: 'Add an event name.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Choose a date.' };
  if (description.length < 4) return { error: 'Add a short description.' };

  return update((db) => {
    if (existingId) {
      const event = db.events.find((item) => item.id === existingId);
      if (!event) return { error: 'Event not found.' };
      event.name = name.slice(0, 80);
      event.date = date;
      event.description = description.slice(0, 400);
      event.ctaLabel = (input.ctaLabel || 'View event').trim().slice(0, 32);
      event.ctaHref = (input.ctaHref || '/reserve').trim().slice(0, 200);
      event.status = input.status === 'draft' ? 'draft' : 'published';
      if (typeof input.image === 'string' && input.image) event.image = input.image;
      return { event };
    }
    const event: EventRecord = {
      id: id('event'),
      name: name.slice(0, 80),
      date,
      description: description.slice(0, 400),
      image: input.image || '',
      ctaLabel: (input.ctaLabel || 'View event').trim().slice(0, 32),
      ctaHref: (input.ctaHref || '/reserve').trim().slice(0, 200),
      status: input.status === 'draft' ? 'draft' : 'published',
      createdAt: new Date().toISOString(),
    };
    db.events.unshift(event);
    return { event };
  });
}

export async function deleteEvent(eventId: string) {
  return update((db) => {
    const before = db.events.length;
    db.events = db.events.filter((event) => event.id !== eventId);
    if (db.events.length === before) return { error: 'Event not found.' };
    return { ok: true };
  });
}

export function saveUpload(filename: string, bytes: Buffer) {
  fs.mkdirSync(UPLOADS, { recursive: true });
  const safe = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 60) || 'image';
  const stored = `${Date.now()}-${safe}`;
  fs.writeFileSync(path.join(UPLOADS, stored), bytes);
  return `/api/media/${stored}`;
}

export function readUpload(name: string) {
  const base = path.basename(name);
  const file = path.resolve(UPLOADS, base);
  const relative = path.relative(UPLOADS, file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file)) return null;
  return file;
}

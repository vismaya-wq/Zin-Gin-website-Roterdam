import type { SupabaseClient } from '@supabase/supabase-js';
import { CATEGORIES, type CategoryId, type DietaryTag } from '../data/menu';
import type {
  BookPage,
  EventRecord,
  GalleryRecord,
  MenuRecord,
  Reservation,
  BookingStatus,
} from '../data/ops';
import {
  BREAKFAST_SLOTS,
  DINNER_SLOTS,
  SEATING_PREFERENCES,
  slotsForSession,
  type DiningSession,
  type SeatingId,
} from '../data/hotel';
import type { ReservationInput } from './db';

const ITEMS_PER_MENU_SHEET = 7;
const ALL_SLOTS = [...BREAKFAST_SLOTS, ...DINNER_SLOTS];
const TAGS = new Set<DietaryTag>(['VEG', 'VEGAN', 'GF', 'NUTS', 'SPICY']);

type DbReservation = {
  id: string;
  guest_name: string;
  phone: string;
  email: string;
  room_number: string | null;
  guest_count: number;
  booking_date: string;
  meal_session: DiningSession;
  booking_time: string;
  seating_preference: string;
  remarks: string;
  status: BookingStatus;
  manager_note: string;
  suggested_time: string | null;
  suggested_seating: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
};

type DbCategory = { id: string; name: string; slug: string; sort_order: number; visible: boolean };
type DbMenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  is_vegan: boolean;
  has_gluten: boolean;
  has_nuts: boolean;
  is_spicy: boolean;
  visible: boolean;
  sort_order: number;
  image_url: string | null;
};

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay();
}

function tagsFromRow(row: Pick<DbMenuItem, 'is_veg' | 'is_vegan' | 'has_gluten' | 'has_nuts' | 'is_spicy'>): DietaryTag[] {
  const tags: DietaryTag[] = [];
  if (row.is_veg) tags.push('VEG');
  if (row.is_vegan) tags.push('VEGAN');
  if (row.has_gluten) tags.push('GF');
  if (row.has_nuts) tags.push('NUTS');
  if (row.is_spicy) tags.push('SPICY');
  return tags;
}

function rowFromTags(tags: unknown) {
  const list = Array.isArray(tags) ? tags.filter((t): t is DietaryTag => typeof t === 'string' && TAGS.has(t as DietaryTag)) : [];
  return {
    is_veg: list.includes('VEG'),
    is_vegan: list.includes('VEGAN'),
    has_gluten: list.includes('GF'),
    has_nuts: list.includes('NUTS'),
    is_spicy: list.includes('SPICY'),
  };
}

function mapReservation(row: DbReservation): Reservation & { confirmedByName?: string } {
  return {
    id: row.id,
    name: row.guest_name,
    phone: row.phone,
    email: row.email,
    guests: row.guest_count,
    roomNumber: row.room_number || '',
    date: row.booking_date,
    diningSession: row.meal_session,
    time: row.booking_time,
    seating: row.seating_preference as SeatingId,
    remarks: row.remarks,
    status: row.status,
    createdAt: row.created_at,
    confirmedBy: row.confirmed_by || '',
    confirmedAt: row.confirmed_at || '',
    internalNote: row.manager_note,
    alternativeTime: row.suggested_time || '',
    alternativeSeating: row.suggested_seating || '',
    confirmedByName: row.profiles?.full_name,
  };
}

function mapMenuItem(row: DbMenuItem, categorySlug: CategoryId): MenuRecord {
  return {
    id: row.id,
    category: categorySlug,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    tags: tagsFromRow(row),
    image: row.image_url || undefined,
    sortOrder: row.sort_order,
    available: row.visible,
    featured: false,
  };
}

export async function sbCreateReservation(supabase: SupabaseClient, input: ReservationInput) {
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

  const { error } = await supabase.from('reservations').insert({
    guest_name: name,
    phone,
    email,
    room_number: roomNumber || null,
    guest_count: guests,
    booking_date: date,
    meal_session: diningSession,
    booking_time: time,
    seating_preference: seating,
    remarks,
    status: 'pending',
  });

  if (error) return { error: 'We could not save your request. Please call the restaurant.' };
  return {
    ok: true as const,
    reservation: {
      id: '',
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
    },
  };
}

export async function sbListReservations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, profiles:confirmed_by(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Could not load reservations.');
  return (data as DbReservation[]).map((row) => ({
    ...mapReservation(row),
    assignedName: '',
    notifications: [] as { channel: string; provider: string; status: string }[],
  }));
}

export async function sbActOnReservation(
  supabase: SupabaseClient,
  reservationId: string,
  actorId: string,
  action: string,
  extra: { time?: string; seating?: string; note?: string },
) {
  const { data: existing, error: loadError } = await supabase.from('reservations').select('*').eq('id', reservationId).maybeSingle();
  if (loadError || !existing) return { error: 'Booking not found.' };

  const patch: Record<string, unknown> = {};
  const now = new Date().toISOString();

  if (action === 'confirm') {
    patch.status = 'confirmed';
    patch.confirmed_by = actorId;
    patch.confirmed_at = now;
  } else if (action === 'decline') {
    patch.status = 'declined';
  } else if (action === 'cancel') {
    patch.status = 'cancelled';
  } else if (action === 'note') {
    patch.manager_note = (extra.note || '').trim().slice(0, 800);
  } else if (action === 'suggest-time') {
    if (!(ALL_SLOTS as readonly string[]).includes(extra.time || '')) return { error: 'Choose a dining time.' };
    patch.status = 'alternative_suggested';
    patch.suggested_time = extra.time || '';
  } else if (action === 'suggest-seating') {
    if (!SEATING_PREFERENCES.some((item) => item.id === extra.seating)) return { error: 'Choose a seating option.' };
    patch.status = 'alternative_suggested';
    patch.suggested_seating = extra.seating || '';
  } else {
    return { error: 'Unknown action.' };
  }

  const { error } = await supabase.from('reservations').update(patch).eq('id', reservationId);
  if (error) return { error: 'Could not update that booking.' };
  return { ok: true };
}

async function loadCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('menu_categories').select('*').order('sort_order');
  if (error) throw new Error('Could not load menu categories.');
  return (data || []) as DbCategory[];
}

async function loadMenuItems(supabase: SupabaseClient, includeHidden: boolean) {
  let query = supabase.from('menu_items').select('*').order('sort_order');
  if (!includeHidden) query = query.eq('visible', true);
  const { data, error } = await query;
  if (error) throw new Error('Could not load menu.');
  return (data || []) as DbMenuItem[];
}

export async function sbGetMenuRecords(supabase: SupabaseClient) {
  const categories = await loadCategories(supabase);
  const items = await loadMenuItems(supabase, true);
  const slugById = new Map(categories.map((c) => [c.id, c.slug as CategoryId]));
  return items
    .map((item) => mapMenuItem(item, slugById.get(item.category_id) || 'starters'))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function bookFromMenuRecords(items: MenuRecord[], categories: { slug: string; name: string; sort_order: number }[]): BookPage[] {
  const visible = items.filter((item) => item.available).sort((a, b) => a.sortOrder - b.sortOrder);
  const pages: BookPage[] = [];
  const orderedCats = [...categories].sort((a, b) => a.sort_order - b.sort_order);
  for (const category of orderedCats) {
    const catItems = visible.filter((item) => item.category === category.slug);
    const label = category.name;
    for (let offset = 0; offset < catItems.length; offset += ITEMS_PER_MENU_SHEET) {
      const chunk = catItems.slice(offset, offset + ITEMS_PER_MENU_SHEET);
      pages.push({
        id: `${category.slug}-${offset}`,
        kicker: 'The menu',
        title: offset === 0 ? label : `${label} · continued`,
        groups: [{ id: category.slug, label, items: chunk }],
      });
    }
  }
  if (!pages.length) {
    return [{ id: 'empty', kicker: 'Zin & Gin', title: 'Menu', groups: [] }];
  }
  return pages;
}

export async function sbGetPublicBook(supabase: SupabaseClient) {
  const categories = await loadCategories(supabase);
  const visibleCats = categories.filter((c) => c.visible);
  const items = await loadMenuItems(supabase, false);
  const slugById = new Map(categories.map((c) => [c.id, c.slug as CategoryId]));
  const records = items
    .filter((item) => visibleCats.some((c) => c.id === item.category_id))
    .map((item) => mapMenuItem(item, slugById.get(item.category_id) || 'starters'));
  return bookFromMenuRecords(records, visibleCats.map((c) => ({ slug: c.slug, name: c.name, sort_order: c.sort_order })));
}

export async function sbGetAdminCategories(supabase: SupabaseClient) {
  const categories = await loadCategories(supabase);
  return categories
    .filter((c) => c.slug !== 'popular')
    .map((c) => ({
      id: c.slug as CategoryId,
      label: c.name,
      dbId: c.id,
      sortOrder: c.sort_order,
      visible: c.visible,
    }));
}

export async function sbSaveMenuCategory(
  supabase: SupabaseClient,
  input: { id?: string; name: string; slug?: string; visible?: boolean; sortOrder?: number },
) {
  const name = input.name.trim();
  if (name.length < 2) return { error: 'Add a category name.' };
  if (input.id) {
    const { error } = await supabase
      .from('menu_categories')
      .update({ name, visible: input.visible !== false, sort_order: input.sortOrder })
      .eq('slug', input.id);
    if (error) return { error: 'Could not update category.' };
    return { ok: true };
  }
  const slug = (input.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).slice(0, 48);
  const { error } = await supabase.from('menu_categories').insert({
    name,
    slug,
    visible: input.visible !== false,
    sort_order: input.sortOrder ?? 999,
  });
  if (error) return { error: 'Could not add category.' };
  return { ok: true };
}

export async function sbSaveMenuItem(supabase: SupabaseClient, input: Partial<MenuRecord> & { name?: string }, existingId?: string) {
  const name = (input.name || '').trim();
  const price = Number(input.price);
  const categorySlug = (input.category || '') as CategoryId;
  if (name.length < 2) return { error: 'Add a dish name.' };
  if (!Number.isFinite(price) || price < 0 || price > 500) return { error: 'Add a price.' };

  const categories = await loadCategories(supabase);
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return { error: 'Choose a category.' };

  const dietary = rowFromTags(input.tags);
  const payload = {
    category_id: category.id,
    name,
    description: (input.description || '').trim().slice(0, 280),
    price: Math.round(price * 100) / 100,
    visible: input.available !== false,
    image_url: typeof input.image === 'string' ? input.image : undefined,
    ...(Number.isFinite(input.sortOrder) ? { sort_order: input.sortOrder } : {}),
    ...dietary,
  };

  if (existingId) {
    const { data, error } = await supabase.from('menu_items').update(payload).eq('id', existingId).select('*').single();
    if (error || !data) return { error: 'Dish not found.' };
    return { item: mapMenuItem(data as DbMenuItem, categorySlug) };
  }

  const { data: maxRow } = await supabase.from('menu_items').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const sort_order = Number.isFinite(input.sortOrder) ? input.sortOrder : (maxRow?.[0]?.sort_order ?? 0) + 1;
  const { data, error } = await supabase
    .from('menu_items')
    .insert({ ...payload, sort_order })
    .select('*')
    .single();
  if (error || !data) return { error: 'Could not add dish.' };
  return { item: mapMenuItem(data as DbMenuItem, categorySlug) };
}

export async function sbReorderMenuItem(supabase: SupabaseClient, itemId: string, direction: 'up' | 'down') {
  const items = await sbGetMenuRecords(supabase);
  const item = items.find((d) => d.id === itemId);
  if (!item) return { error: 'Dish not found.' };
  const siblings = items.filter((d) => d.category === item.category).sort((a, b) => a.sortOrder - b.sortOrder);
  const index = siblings.findIndex((d) => d.id === itemId);
  const swap = siblings[index + (direction === 'up' ? -1 : 1)];
  if (!swap) return { ok: true };
  await supabase.from('menu_items').update({ sort_order: swap.sortOrder }).eq('id', item.id);
  await supabase.from('menu_items').update({ sort_order: item.sortOrder }).eq('id', swap.id);
  return { ok: true };
}

export async function sbDeleteMenuItem(supabase: SupabaseClient, itemId: string) {
  const { error, count } = await supabase.from('menu_items').delete({ count: 'exact' }).eq('id', itemId);
  if (error || !count) return { error: 'Dish not found.' };
  return { ok: true };
}

export async function sbListEvents(supabase: SupabaseClient, includeDrafts: boolean) {
  let query = supabase.from('events').select('*').order('event_date');
  if (!includeDrafts) query = query.eq('published', true);
  const { data, error } = await query;
  if (error) throw new Error('Could not load events.');
  return (data || []).map(
    (row): EventRecord => ({
      id: row.id,
      name: row.title,
      date: row.event_date,
      image: row.image_url || '',
      description: row.description,
      ctaLabel: row.cta_label || 'View event',
      ctaHref: row.cta_link || '/reserve',
      status: row.published ? 'published' : 'draft',
      createdAt: row.created_at,
    }),
  );
}

export async function sbSaveEvent(supabase: SupabaseClient, input: Partial<EventRecord>, existingId?: string) {
  const title = (input.name || '').trim();
  const date = (input.date || '').trim();
  const description = (input.description || '').trim();
  if (title.length < 2) return { error: 'Add an event name.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Choose a date.' };
  if (description.length < 4) return { error: 'Add a short description.' };

  const payload = {
    title: title.slice(0, 80),
    event_date: date,
    description: description.slice(0, 400),
    cta_label: (input.ctaLabel || 'View event').trim().slice(0, 32),
    cta_link: (input.ctaHref || '/reserve').trim().slice(0, 200),
    published: input.status !== 'draft',
    image_url: input.image || '',
  };

  if (existingId) {
    const { data, error } = await supabase.from('events').update(payload).eq('id', existingId).select('*').single();
    if (error || !data) return { error: 'Event not found.' };
    return { event: (await sbListEvents(supabase, true)).find((e) => e.id === existingId)! };
  }

  const { data, error } = await supabase.from('events').insert(payload).select('*').single();
  if (error || !data) return { error: 'Could not add event.' };
  return {
    event: {
      id: data.id,
      name: data.title,
      date: data.event_date,
      image: data.image_url,
      description: data.description,
      ctaLabel: data.cta_label,
      ctaHref: data.cta_link,
      status: data.published ? 'published' : 'draft',
      createdAt: data.created_at,
    } as EventRecord,
  };
}

export async function sbDeleteEvent(supabase: SupabaseClient, eventId: string) {
  const { error, count } = await supabase.from('events').delete({ count: 'exact' }).eq('id', eventId);
  if (error || !count) return { error: 'Event not found.' };
  return { ok: true };
}

export async function sbGetGalleryRecords(supabase: SupabaseClient, includeHidden = false) {
  let query = supabase.from('gallery').select('*').order('sort_order');
  if (!includeHidden) query = query.eq('visible', true);
  const { data, error } = await query;
  if (error) throw new Error('Could not load gallery.');
  return (data || []).map(
    (row): GalleryRecord => ({
      id: row.id,
      src: row.image_url,
      alt: row.caption || 'Zin & Gin',
      caption: row.caption || '',
      sortOrder: row.sort_order,
      visible: row.visible,
    }),
  );
}

export async function sbSaveGalleryItem(
  supabase: SupabaseClient,
  input: Partial<GalleryRecord> & { src?: string; visible?: boolean },
  existingId?: string,
) {
  const src = (input.src || '').trim();
  const caption = (input.caption ?? '').trim();

  if (existingId) {
    const updates: { caption: string; image_url?: string; visible: boolean } = {
      caption,
      visible: input.visible !== false,
    };
    if (src) updates.image_url = src;
    const { data, error } = await supabase.from('gallery').update(updates).eq('id', existingId).select('*').single();
    if (error || !data) return { error: 'Image not found.' };
    return {
      item: {
        id: data.id,
        src: data.image_url,
        alt: data.caption || 'Zin & Gin',
        caption: data.caption || '',
        sortOrder: data.sort_order,
      } as GalleryRecord,
    };
  }

  if (!src) return { error: 'Upload an image.' };

  const { data: maxRow } = await supabase.from('gallery').select('sort_order').order('sort_order', { ascending: false }).limit(1);
  const sort_order = (maxRow?.[0]?.sort_order ?? -1) + 1;
  const { data, error } = await supabase
    .from('gallery')
    .insert({ image_url: src, caption, sort_order, visible: input.visible !== false })
    .select('*')
    .single();
  if (error || !data) return { error: 'Could not add image.' };
  return {
    item: {
      id: data.id,
      src: data.image_url,
      alt: data.caption || 'Zin & Gin',
      caption: data.caption || '',
      sortOrder: data.sort_order,
    } as GalleryRecord,
  };
}

export async function sbReorderGalleryItem(supabase: SupabaseClient, itemId: string, direction: 'up' | 'down') {
  const items = await sbGetGalleryRecords(supabase, true);
  const index = items.findIndex((row) => row.id === itemId);
  const swap = items[index + (direction === 'up' ? -1 : 1)];
  if (!swap) return { ok: true };
  await supabase.from('gallery').update({ sort_order: swap.sortOrder }).eq('id', items[index].id);
  await supabase.from('gallery').update({ sort_order: items[index].sortOrder }).eq('id', swap.id);
  return { ok: true };
}

export async function sbDeleteGalleryItem(supabase: SupabaseClient, itemId: string) {
  const { error, count } = await supabase.from('gallery').delete({ count: 'exact' }).eq('id', itemId);
  if (error || !count) return { error: 'Image not found.' };
  return { ok: true };
}

export async function sbUploadImage(supabase: SupabaseClient, bucket: 'gallery' | 'events' | 'menu', filename: string, bytes: Buffer, contentType: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 60) || 'image.jpg';
  const path = `${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType, upsert: false });
  if (error) return { error: 'Upload failed. Try a smaller JPG or PNG.' };
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function sbDashboardStats(supabase: SupabaseClient) {
  const today = todayISO();
  const [{ count: pendingToday }, { count: upcoming }, { count: menuVisible }, { count: galleryCount }, events] = await Promise.all([
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('booking_date', today),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).gte('booking_date', today).in('status', ['pending', 'confirmed']),
    supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('visible', true),
    supabase.from('gallery').select('*', { count: 'exact', head: true }).eq('visible', true),
    sbListEvents(supabase, false),
  ]);

  const upcomingEvents = events.filter((e) => e.date >= today).length;

  return {
    pendingToday: pendingToday ?? 0,
    upcomingReservations: upcoming ?? 0,
    menuVisible: menuVisible ?? 0,
    galleryVisible: galleryCount ?? 0,
    upcomingEvents,
  };
}

/** Seed categories from static CATEGORIES when table is empty (one-time). */
export async function sbEnsureMenuSeed(supabase: SupabaseClient) {
  const { count } = await supabase.from('menu_categories').select('*', { count: 'exact', head: true });
  if (count && count > 0) return;
  const rows = CATEGORIES.filter((c) => c.id !== 'popular').map((c, index) => ({
    name: c.label,
    slug: c.id,
    sort_order: index,
    visible: true,
  }));
  await supabase.from('menu_categories').insert(rows);
}

import { useEffect, useMemo, useState } from 'react';
import type { BookingStatus, EventRecord, MenuRecord, Reservation, Role } from '../data/ops';
import { BREAKFAST_SLOTS, DINNER_SLOTS, SEATING_PREFERENCES } from '../data/hotel';
import { formatPrice, type CategoryId, type DietaryTag } from '../data/menu';
import { EventSitePreview } from './AdminCmsPreviews';
import '../styles/admin.css';

interface Booking extends Reservation {
  notifications: { channel: string; provider: string; status: string }[];
}

const STATUS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  alternative_suggested: 'Alternative suggested',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

type Section = 'bookings' | 'menu' | 'events' | 'gallery';
type ListFilter = 'pending' | 'today' | 'upcoming' | 'confirmed' | 'all';

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const ALL_SLOTS = [...BREAKFAST_SLOTS, ...DINNER_SLOTS];

const TABS = {
  bookings: { label: 'Reservations', lead: 'Review requests, confirm tables, and leave internal notes.' },
  events: { label: 'Events', lead: 'Manage upcoming events on the homepage.' },
  menu: { label: 'Menu', lead: 'Update dishes, prices and dietary tags.' },
  gallery: { label: 'Gallery', lead: 'Upload photos and captions for the gallery page.' },
} as const;

const seatName = (id: string) => SEATING_PREFERENCES.find((item) => item.id === id)?.label ?? id;

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...init?.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function when(iso: string) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Amsterdam' }).format(new Date(iso));
}

export default function AdminApp({
  role,
  name,
  section = 'bookings',
}: {
  role: Role;
  name: string;
  section?: Section;
}) {
  const tab = section;
  const [filter, setFilter] = useState<ListFilter>('pending');
  const [bookingView, setBookingView] = useState<'list' | 'calendar'>('list');
  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => todayISO().slice(0, 7));
  const [calendarDate, setCalendarDate] = useState(todayISO());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [menu, setMenu] = useState<MenuRecord[]>([]);
  const [categories, setCategories] = useState<{ id: CategoryId; label: string }[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [error, setError] = useState('');
  const canManageCms = role === 'owner';
  const canManageReservations = role === 'owner' || role === 'manager';

  async function loadBookings() {
    const data = await api('/api/admin/reservations');
    setBookings(data.reservations);
  }

  useEffect(() => {
    if (tab === 'bookings') {
      loadBookings().catch((err) => setError(err.message));
      return;
    }
    if (!canManageCms) return;
    const run =
      tab === 'menu'
        ? api('/api/admin/menu').then((data) => {
            setMenu(data.items);
            setCategories(data.categories);
          })
        : tab === 'events'
          ? api('/api/admin/events').then((data) => setEvents(data.events))
          : null;
    run?.catch((err) => setError(err.message));
  }, [tab, canManageCms]);

  const today = todayISO();
  const visible = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return booking.status === 'pending';
    if (filter === 'confirmed') return booking.status === 'confirmed';
    if (filter === 'today') return booking.date === today;
    if (filter === 'upcoming') return booking.date >= today;
    return true;
  });
  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings]);

  const navLinks: { href: string; label: string; show: boolean }[] = [
    { href: '/admin', label: 'Dashboard', show: true },
    { href: '/admin/reservations', label: 'Reservations', show: true },
    { href: '/admin/menu', label: 'Menu', show: canManageCms },
    { href: '/admin/events', label: 'Events', show: canManageCms },
    { href: '/admin/gallery', label: 'Gallery', show: canManageCms },
  ];

  return (
    <div className="desk">
      <aside className="desk__side">
        <div className="desk__brand">
          <strong>Zin &amp; Gin</strong>
          <span>Content management</span>
        </div>
        <nav className="desk__nav" aria-label="Admin sections">
          {navLinks
            .filter((link) => link.show)
            .map((link) => {
              const active =
                (link.href === '/admin/reservations' && tab === 'bookings') ||
                (link.href === '/admin/menu' && tab === 'menu') ||
                (link.href === '/admin/events' && tab === 'events') ||
                (link.href === '/admin/gallery' && tab === 'gallery');
              return (
              <a key={link.href} className={active ? 'is-on' : ''} href={link.href}>
                {link.label}
                {link.href === '/admin/reservations' && pendingCount > 0 ? <em>{pendingCount}</em> : null}
              </a>
              );
            })}
        </nav>
        <div className="desk__user">
          <p>
            Signed in as <strong>{name}</strong>
            <br />
            {role} access
          </p>
          <button
            type="button"
            onClick={async () => {
              await api('/api/admin/logout', { method: 'POST' });
              location.href = '/admin';
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="desk__content">
        <header className="desk__page-head">
          <h1>{TABS[tab].label}</h1>
          <p>{TABS[tab].lead}</p>
        </header>

        {error && <p className="desk__alert" role="alert">{error}</p>}

        {tab === 'bookings' && (
          <>
            <div className="desk__stats">
              <div className="desk__stat">
                <strong>{pendingCount}</strong>
                <span>Pending</span>
              </div>
              <div className="desk__stat">
                <strong>{bookings.filter((b) => b.status === 'confirmed').length}</strong>
                <span>Confirmed</span>
              </div>
              <div className="desk__stat">
                <strong>{bookings.length}</strong>
                <span>All requests</span>
              </div>
            </div>
            <div className="filters" role="tablist" aria-label="Reservation view">
              <button type="button" className={bookingView === 'list' ? 'is-on' : ''} onClick={() => setBookingView('list')}>List view</button>
              <button type="button" className={bookingView === 'calendar' ? 'is-on' : ''} onClick={() => setBookingView('calendar')}>Calendar view</button>
            </div>
            <div className="filters" role="tablist" aria-label="Filter reservations">
              {(
                [
                  ['pending', 'Pending'],
                  ['today', 'Today'],
                  ['upcoming', 'Upcoming'],
                  ['confirmed', 'Confirmed'],
                  ['all', 'All'],
                ] as const
              ).map(([item, label]) => (
                <button key={item} type="button" className={filter === item ? 'is-on' : ''} onClick={() => setFilter(item)}>
                  {label}
                </button>
              ))}
            </div>
            {bookingView === 'list' ? (
              <ReservationList bookings={visible} onOpen={setOpenBookingId} />
            ) : (
              <ReservationCalendar
                bookings={visible}
                month={calendarMonth}
                selected={calendarDate}
                onMonth={setCalendarMonth}
                onSelect={setCalendarDate}
                onOpen={setOpenBookingId}
              />
            )}
            {openBookingId && bookings.find((booking) => booking.id === openBookingId) && (
              <div className="desk-modal" role="dialog" aria-modal="true" aria-label="Reservation details">
                <button type="button" className="desk-modal__close" onClick={() => setOpenBookingId(null)}>Close</button>
                <BookingCard
                  booking={bookings.find((booking) => booking.id === openBookingId)!}
                  canManage={canManageReservations}
                  onReload={loadBookings}
                />
              </div>
            )}
          </>
        )}

        {tab === 'menu' && canManageCms && (
          <>
            <MenuTools onImported={async () => { const data = await api('/api/admin/menu'); setMenu(data.items); setCategories(data.categories); }} />
            <MenuForm categories={categories} onSave={async (body) => { await api('/api/admin/menu', { method: 'POST', body: JSON.stringify(body) }); const data = await api('/api/admin/menu'); setMenu(data.items); }} />
            <div className="desk__list">
              {menu.map((item) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  categories={categories}
                  onChange={async (body) => { await api(`/api/admin/menu/${item.id}`, { method: 'PATCH', body: JSON.stringify(body) }); const data = await api('/api/admin/menu'); setMenu(data.items); }}
                  onReorder={async (direction) => { await api(`/api/admin/menu/${item.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'reorder', direction }) }); const data = await api('/api/admin/menu'); setMenu(data.items); }}
                  onDelete={async () => { await api(`/api/admin/menu/${item.id}`, { method: 'DELETE' }); setMenu((current) => current.filter((dish) => dish.id !== item.id)); }}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'events' && canManageCms && (
          <>
            <section className="cms-block">
              <header className="cms-block__head">
                <h2>Create event</h2>
                <p>Published events appear in What&apos;s On on the homepage. Drafts stay hidden until you publish.</p>
              </header>
              {events.filter((e) => e.status === 'published').length > 0 && (
                <div className="cms-on-site">
                  <p className="cms-on-site__label">Live on website now</p>
                  <div className="cms-on-site__scroll">
                    {events
                      .filter((e) => e.status === 'published')
                      .map((event) => (
                        <EventSitePreview
                          key={event.id}
                          name={event.name}
                          date={event.date}
                          description={event.description}
                          image={event.image}
                          ctaLabel={event.ctaLabel}
                          status={event.status}
                          label="Published"
                        />
                      ))}
                  </div>
                </div>
              )}
              <EventForm onSave={async (body) => { await api('/api/admin/events', { method: 'POST', body: JSON.stringify(body) }); setEvents((await api('/api/admin/events')).events); }} />
            </section>
            <section className="cms-block cms-block--list">
              <header className="cms-block__head">
                <h2>All events</h2>
                <p>Edit or remove existing events. The preview shows how each card looks today.</p>
              </header>
              <div className="desk__list desk__list--cms">
                {events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    onChange={async (body) => { await api(`/api/admin/events/${event.id}`, { method: 'PATCH', body: JSON.stringify(body) }); setEvents((await api('/api/admin/events')).events); }}
                    onDelete={async () => { await api(`/api/admin/events/${event.id}`, { method: 'DELETE' }); setEvents((current) => current.filter((item) => item.id !== event.id)); }}
                  />
                ))}
                {events.length === 0 && (
                  <div className="desk__empty">
                    <strong>No events yet</strong>
                    Create one above — you&apos;ll see the homepage preview as you type.
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {tab === 'gallery' && canManageCms && <GalleryAddForm onAdded={async () => undefined} />}
      </div>
    </div>
  );
}

function ReservationList({ bookings, onOpen }: { bookings: Booking[]; onOpen: (id: string) => void }) {
  const groups = new Map<string, Booking[]>();
  [...bookings]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .forEach((booking) => {
      const list = groups.get(booking.date) || [];
      list.push(booking);
      groups.set(booking.date, list);
    });
  if (!bookings.length) {
    return (
      <div className="desk__empty">
        <strong>No reservations here</strong>
        Try another filter, or wait for the next guest request from the website.
      </div>
    );
  }
  return (
    <div className="res-list">
      {[...groups.entries()].map(([date, rows]) => (
        <section key={date}>
          <h2>{date}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Time</th>
                <th>Number of people</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <button type="button" onClick={() => onOpen(booking.id)}>{booking.name}</button>
                  </td>
                  <td>{booking.time}</td>
                  <td>{booking.guests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

function ReservationCalendar({
  bookings,
  month,
  selected,
  onMonth,
  onSelect,
  onOpen,
}: {
  bookings: Booking[];
  month: string;
  selected: string;
  onMonth: (value: string) => void;
  onSelect: (value: string) => void;
  onOpen: (id: string) => void;
}) {
  const [year, monthIndex] = month.split('-').map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const days = new Date(year, monthIndex, 0).getDate();
  const counts = new Map<string, number>();
  bookings.forEach((booking) => counts.set(booking.date, (counts.get(booking.date) || 0) + 1));
  const shift = (delta: number) => {
    const next = new Date(year, monthIndex - 1 + delta, 1);
    onMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };
  const dayBookings = bookings
    .filter((booking) => booking.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div className="res-cal">
      <div className="res-cal__nav">
        <button type="button" onClick={() => shift(-1)}>Previous</button>
        <strong>{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" onClick={() => shift(1)}>Next</button>
      </div>
      <div className="res-cal__grid">
        {Array.from({ length: first.getDay() === 0 ? 6 : first.getDay() - 1 }, (_, index) => (
          <span key={`pad-${index}`} />
        ))}
        {Array.from({ length: days }, (_, index) => {
          const date = `${month}-${String(index + 1).padStart(2, '0')}`;
          const count = counts.get(date) || 0;
          return (
            <button key={date} type="button" className={date === selected ? 'is-on' : ''} onClick={() => onSelect(date)}>
              <b>{index + 1}</b>
              {count > 0 && <small>{count}</small>}
            </button>
          );
        })}
      </div>
      <ul className="res-cal__day">
        {dayBookings.map((booking) => (
          <li key={booking.id}>
            <button type="button" onClick={() => onOpen(booking.id)}>{booking.name}</button>
            <span>{booking.time} · {booking.guests} people</span>
          </li>
        ))}
        {dayBookings.length === 0 && <li>No reservations on this date.</li>}
      </ul>
    </div>
  );
}

function MenuTools({ onImported }: { onImported: () => Promise<void> }) {
  const [preview, setPreview] = useState<{ summary: { add: number; update: number; delete: number }; errors: { line: number; message: string }[] } | null>(null);
  const [csv, setCsv] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const download = async (path: string, name: string) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Download failed.');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="cms-block">
      <header className="cms-block__head">
        <h2>Menu files</h2>
        <p>Export the live menu, edit it, then import. Deletions only happen when a row says DELETE and you confirm.</p>
      </header>
      <div className="menu-tools">
        <button type="button" onClick={() => download('/api/admin/menu-csv', 'zin-gin-menu.csv').catch((reason) => setNotice(reason.message))}>Export CSV</button>
        <button type="button" onClick={() => download('/api/admin/menu-pdf', 'zin-gin-menu-a5.pdf').catch((reason) => setNotice(reason.message))}>Download A5 Menu PDF</button>
        <label className="menu-tools__file">
          Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              setCsv(text);
              setBusy(true);
              try {
                const data = await api('/api/admin/menu-csv', { method: 'POST', body: JSON.stringify({ csv: text }) });
                setPreview({ summary: data.summary, errors: data.errors || [] });
                setNotice('');
              } catch (reason) {
                setNotice(reason instanceof Error ? reason.message : 'Could not read that file.');
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>
      {notice && <p role="alert">{notice}</p>}
      {preview && (
        <div className="menu-preview">
          <p>{preview.summary.add} to add, {preview.summary.update} to update, {preview.summary.delete} to delete.</p>
          {preview.summary.delete > 0 && <p>Deleting dishes cannot be undone. Confirm only if those DELETE rows are intentional.</p>}
          {preview.errors.map((error) => (
            <p key={`${error.line}-${error.message}`} role="alert">Row {error.line}: {error.message}</p>
          ))}
          <button
            type="button"
            disabled={busy || preview.errors.length > 0 || !csv}
            onClick={async () => {
              setBusy(true);
              try {
                await api('/api/admin/menu-csv', { method: 'POST', body: JSON.stringify({ csv, confirm: true }) });
                setPreview(null);
                setCsv('');
                setNotice('Menu import saved.');
                await onImported();
              } catch (reason) {
                setNotice(reason instanceof Error ? reason.message : 'Import failed.');
              } finally {
                setBusy(false);
              }
            }}
          >
            Confirm import
          </button>
        </div>
      )}
    </section>
  );
}

function BookingCard({
  booking,
  canManage,
  onReload,
}: {
  booking: Booking;
  canManage: boolean;
  onReload: () => Promise<void>;
}) {
  const patch = (body: Record<string, unknown>) =>
    api(`/api/admin/reservations/${booking.id}`, { method: 'PATCH', body: JSON.stringify(body) }).then(onReload);

  return (
    <article className="booking">
      <header className="booking__top">
        <div>
          <h2>{booking.name}</h2>
          <p className="booking__id">{booking.id}</p>
        </div>
        <span className={`pill pill--${booking.status}`}>{STATUS[booking.status]}</span>
      </header>

      <dl className="booking__grid">
        <div className="booking__cell">
          <dt>Date</dt>
          <dd>{booking.date}</dd>
        </div>
        <div className="booking__cell">
          <dt>Session</dt>
          <dd>{booking.diningSession === 'breakfast' ? 'Breakfast' : 'Dinner'}</dd>
        </div>
        <div className="booking__cell">
          <dt>Time</dt>
          <dd>{booking.time}</dd>
        </div>
        <div className="booking__cell">
          <dt>Guests</dt>
          <dd>{booking.guests}</dd>
        </div>
        <div className="booking__cell">
          <dt>Seating</dt>
          <dd>{seatName(booking.seating)}</dd>
        </div>
        <div className="booking__cell">
          <dt>Phone</dt>
          <dd>{booking.phone}</dd>
        </div>
        <div className="booking__cell">
          <dt>Email</dt>
          <dd>{booking.email || '—'}</dd>
        </div>
        <div className="booking__cell">
          <dt>Room</dt>
          <dd>{booking.roomNumber || '—'}</dd>
        </div>
      </dl>

      {booking.remarks && <p className="booking__remarks">Guest note: {booking.remarks}</p>}

      <p className="booking__meta">
        Requested {when(booking.createdAt)}
        {booking.confirmedBy && ` · Confirmed ${when(booking.confirmedAt)}`}
        {booking.alternativeTime && ` · Suggested time ${booking.alternativeTime}`}
        {booking.alternativeSeating && ` · Suggested seating ${seatName(booking.alternativeSeating)}`}
      </p>
      {booking.internalNote && <p className="booking__meta">Internal note: {booking.internalNote}</p>}
      {booking.notifications?.length > 0 && (
        <p className="booking__meta">
          Confirmation prepared for {booking.notifications.map((item) => item.channel).join(' and ')} (not sent yet).
        </p>
      )}

      {canManage && (
        <div className="booking__actions">
          <div className="action-row">
            <p className="action-row__label">Quick actions</p>
            <button type="button" className="is-primary" onClick={() => patch({ action: 'confirm' })}>Confirm booking</button>
            <button type="button" className="is-muted" onClick={() => patch({ action: 'decline' })}>Decline</button>
            <button type="button" className="is-danger" onClick={() => patch({ action: 'cancel' })}>Cancel</button>
          </div>
          <div className="action-row">
            <p className="action-row__label">Suggest alternatives</p>
            <select defaultValue="" aria-label="Suggest time" onChange={(event) => { const time = event.target.value; if (time) patch({ action: 'suggest-time', time }); }}>
              <option value="">Suggest time…</option>
              {ALL_SLOTS.map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
            <select defaultValue="" aria-label="Suggest seating" onChange={(event) => { const seating = event.target.value; if (seating) patch({ action: 'suggest-seating', seating }); }}>
              <option value="">Suggest seating…</option>
              {SEATING_PREFERENCES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>
          <form
            className="booking__note"
            onSubmit={(event) => {
              event.preventDefault();
              const note = new FormData(event.currentTarget).get('note');
              patch({ action: 'note', note });
            }}
          >
            <input name="note" placeholder="Internal note for the team" defaultValue={booking.internalNote} aria-label="Internal note" />
            <button type="submit" className="is-muted">Save note</button>
          </form>
        </div>
      )}
    </article>
  );
}

function MenuForm({ categories, onSave }: { categories: { id: string; label: string }[]; onSave: (body: Record<string, unknown>) => Promise<void> }) {
  return (
    <form
      className="composer"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const tags = ['VEG', 'VEGAN', 'GF', 'NUTS', 'SPICY'].filter((tag) => form.get(tag)) as DietaryTag[];
        await onSave({
          name: form.get('name'),
          category: form.get('category'),
          description: form.get('description'),
          price: Number(form.get('price')),
          tags,
          available: true,
        });
        event.currentTarget.reset();
      }}
    >
      <h2>Add a dish</h2>
      <p className="panel-lead">New items appear in the menu book and downloadable PDF.</p>
      <div className="field">
        <label htmlFor="menu-name">Dish name</label>
        <input id="menu-name" name="name" required />
      </div>
      <div className="field">
        <label htmlFor="menu-cat">Category</label>
        <select id="menu-cat" name="category">{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select>
      </div>
      <div className="field">
        <label htmlFor="menu-price">Price (EUR)</label>
        <input id="menu-price" name="price" type="number" step="0.1" min="0" required />
      </div>
      <div className="field field--wide">
        <label htmlFor="menu-desc">Description</label>
        <input id="menu-desc" name="description" placeholder="Short description for the menu" />
      </div>
      <div className="tag-row field--wide">
        <label><input type="checkbox" name="VEG" /> Vegetarian</label>
        <label><input type="checkbox" name="VEGAN" /> Vegan</label>
        <label><input type="checkbox" name="GF" /> Gluten-free</label>
        <label><input type="checkbox" name="NUTS" /> Nuts</label>
        <label><input type="checkbox" name="SPICY" /> Spicy</label>
      </div>
      <button type="submit">Add dish</button>
    </form>
  );
}

function MenuRow({ item, categories, onChange, onReorder, onDelete }: { item: MenuRecord; categories: { id: string; label: string }[]; onChange: (body: Record<string, unknown>) => Promise<void>; onReorder: (direction: 'up' | 'down') => Promise<void>; onDelete: () => Promise<void> }) {
  return (
    <form
      className="row"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const tags = ['VEG', 'VEGAN', 'GF', 'NUTS', 'SPICY'].filter((tag) => form.get(tag)) as DietaryTag[];
        onChange({
          name: form.get('name'),
          category: form.get('category'),
          description: form.get('description'),
          price: Number(form.get('price')),
          tags,
          available: form.get('available') === 'on',
          featured: item.featured,
        });
      }}
    >
      <div className="field">
        <label>Name</label>
        <input name="name" defaultValue={item.name} />
      </div>
      <div className="field">
        <label>Category</label>
        <select name="category" defaultValue={item.category}>{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select>
      </div>
      <div className="field field--wide">
        <label>Description</label>
        <input name="description" defaultValue={item.description} />
      </div>
      <div className="tag-row field--wide">
        <label><input type="checkbox" name="VEG" defaultChecked={item.tags.includes('VEG')} /> Vegetarian</label>
        <label><input type="checkbox" name="VEGAN" defaultChecked={item.tags.includes('VEGAN')} /> Vegan</label>
        <label><input type="checkbox" name="GF" defaultChecked={item.tags.includes('GF')} /> Gluten</label>
        <label><input type="checkbox" name="NUTS" defaultChecked={item.tags.includes('NUTS')} /> Nuts</label>
        <label><input type="checkbox" name="SPICY" defaultChecked={item.tags.includes('SPICY')} /> Spicy</label>
      </div>
      <div className="field">
        <label>Price</label>
        <input name="price" type="number" step="0.1" min="0" defaultValue={item.price} />
      </div>
      <div className="field">
        <label>Shown</label>
        <label className="tag-row"><input type="checkbox" name="available" defaultChecked={item.available} /> Visible on menu</label>
      </div>
      <div className="field">
        <label>Listed as</label>
        <span>{formatPrice(item.price)}</span>
      </div>
      <div className="row__actions">
        <button type="button" className="is-muted" onClick={() => onReorder('up')}>Move up</button>
        <button type="button" className="is-muted" onClick={() => onReorder('down')}>Move down</button>
        <button type="submit">Save</button>
        <button type="button" className="is-danger" onClick={onDelete}>Delete</button>
      </div>
    </form>
  );
}

function EventForm({ onSave }: { onSave: (body: Record<string, unknown>) => Promise<void> }) {
  const [draft, setDraft] = useState({
    name: '',
    date: '',
    description: '',
    ctaLabel: 'View event',
    ctaHref: '/reserve',
    status: 'published',
  });
  const [savedImage, setSavedImage] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const set = (key: keyof typeof draft, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="cms-studio">
      <form
        className="composer composer--studio"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          try {
            const form = new FormData(event.currentTarget);
            const file = form.get('file');
            let nextImage = savedImage;
            if (file instanceof File && file.size) {
              const upload = new FormData();
              upload.set('file', file);
              upload.set('bucket', 'events');
              const saved = await api('/api/admin/upload', { method: 'POST', body: upload });
              nextImage = saved.url;
            }
            await onSave({ ...draft, image: nextImage });
            event.currentTarget.reset();
            setDraft({
              name: '',
              date: '',
              description: '',
              ctaLabel: 'View event',
              ctaHref: '/reserve',
              status: 'published',
            });
            setSavedImage('');
            if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
            setFilePreview('');
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>New event</h2>
        <div className="field">
          <label htmlFor="ev-name">Title</label>
          <input id="ev-name" name="name" required value={draft.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ev-date">Date</label>
          <input id="ev-date" name="date" type="date" required value={draft.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ev-cta">Button label</label>
          <input id="ev-cta" name="ctaLabel" value={draft.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ev-link">Button link</label>
          <input id="ev-link" name="ctaHref" value={draft.ctaHref} onChange={(e) => set('ctaHref', e.target.value)} />
        </div>
        <div className="field field--wide">
          <label htmlFor="ev-desc">Description</label>
          <textarea id="ev-desc" name="description" rows={4} required value={draft.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="field field--wide">
          <label htmlFor="ev-img">Image</label>
          <input
            id="ev-img"
            name="file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
              setFilePreview(URL.createObjectURL(file));
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="ev-status">Status</label>
          <select id="ev-status" name="status" value={draft.status} onChange={(e) => set('status', e.target.value)}>
            <option value="published">Published</option>
            <option value="draft">Draft (hidden)</option>
          </select>
        </div>
        <button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save event'}
        </button>
      </form>
      <EventSitePreview
        name={draft.name}
        date={draft.date}
        description={draft.description}
        image={filePreview || savedImage}
        ctaLabel={draft.ctaLabel}
        status={draft.status}
        label="Preview — new event"
      />
    </div>
  );
}

async function uploadGalleryImage(file: File) {
  const upload = new FormData();
  upload.set('file', file);
  upload.set('bucket', 'gallery');
  const saved = await api('/api/admin/upload', { method: 'POST', body: upload });
  return saved.url as string;
}

function GalleryAddForm({ onAdded }: { onAdded: () => Promise<void> }) {
  const [caption, setCaption] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    return () => {
      if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  return (
    <section className="cms-block">
      <header className="cms-block__head">
        <h2>Add gallery image</h2>
        <p>Upload a photo and add a short caption (shown on hover on the gallery page).</p>
      </header>
      {formError ? <p className="desk__alert">{formError}</p> : null}
      <div className="cms-studio">
        <form
          className="composer composer--studio"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setFormError('');
            try {
              const form = new FormData(event.currentTarget);
              const file = form.get('file');
              if (!(file instanceof File) || !file.size) throw new Error('Choose an image to upload.');
              const nextSrc = await uploadGalleryImage(file);
              const nextCaption = String(form.get('caption') || '').trim();
              await api('/api/admin/gallery', {
                method: 'POST',
                body: JSON.stringify({ src: nextSrc, caption: nextCaption }),
              });
              setCaption('');
              if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
              setFilePreview('');
              event.currentTarget.reset();
              await onAdded();
            } catch (err) {
              setFormError(err instanceof Error ? err.message : 'Could not add image.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="field field--wide">
            <label htmlFor="gal-file">Image</label>
            <input
              id="gal-file"
              name="file"
              type="file"
              accept="image/*"
              required
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
                setFilePreview(URL.createObjectURL(file));
              }}
            />
          </div>
          <div className="field field--wide">
            <label htmlFor="gal-cap">Caption</label>
            <input
              id="gal-cap"
              name="caption"
              placeholder="e.g. Crisp masala dosa with chutneys"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <button type="submit" disabled={busy}>
            {busy ? 'Adding…' : 'Add to gallery'}
          </button>
        </form>
        <div className="cms-preview-panel__inner cms-preview-panel__inner--light">
          <p className="cms-preview-label cms-preview-label--site">Preview — as on gallery page</p>
          <article className="gallery-add-preview">
            {filePreview ? (
              <>
                <img className="gallery-add-preview__photo" src={filePreview} alt="" />
                {caption.trim() ? <span className="gallery-add-preview__cap">{caption}</span> : null}
              </>
            ) : (
              <div className="gallery-add-preview__empty">Choose an image to see preview</div>
            )}
          </article>
          <p className="gallery-preview-note gallery-preview-note--light">
            {caption.trim()
              ? 'Caption overlay matches hover on the public gallery.'
              : 'Add a caption to preview the hover label.'}
          </p>
        </div>
      </div>
    </section>
  );
}

function EventRow({ event, onChange, onDelete }: { event: EventRecord; onChange: (body: Record<string, unknown>) => Promise<void>; onDelete: () => Promise<void> }) {
  return (
    <div className="cms-edit-card">
      <form
        className="row row--cms"
        onSubmit={(eventForm) => {
          eventForm.preventDefault();
          const form = new FormData(eventForm.currentTarget);
          onChange({
            name: form.get('name'),
            date: form.get('date'),
            description: form.get('description'),
            ctaLabel: form.get('ctaLabel'),
            ctaHref: form.get('ctaHref'),
            status: form.get('status'),
            image: event.image,
          });
        }}
      >
        <div className="field field--wide">
          <label>Title</label>
          <input name="name" defaultValue={event.name} />
        </div>
        <div className="field">
          <label>Date</label>
          <input name="date" type="date" defaultValue={event.date} />
        </div>
        <div className="field">
          <label>Status</label>
          <select name="status" defaultValue={event.status}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="field">
          <label>Button</label>
          <input name="ctaLabel" defaultValue={event.ctaLabel} />
        </div>
        <div className="field field--wide">
          <label>Link</label>
          <input name="ctaHref" defaultValue={event.ctaHref} />
        </div>
        <div className="field field--wide">
          <label>Description</label>
          <textarea name="description" rows={2} defaultValue={event.description} />
        </div>
        <div className="row__actions">
          <button type="submit">Save changes</button>
          <button type="button" className="is-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </form>
      <EventSitePreview
        name={event.name}
        date={event.date}
        description={event.description}
        image={event.image}
        ctaLabel={event.ctaLabel}
        status={event.status}
        label="Current on site"
      />
    </div>
  );
}

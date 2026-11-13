import { useEffect, useMemo, useState } from 'react';
import { SEATING_PREFERENCES, slotsForSession, type DiningSession, type SeatingId } from '../data/hotel';
import '../styles/reserve-flow.css';

interface Draft {
  name: string;
  phone: string;
  email: string;
  guests: string;
  roomNumber: string;
  date: string;
  diningSession: DiningSession;
  time: string;
  seating: SeatingId | '';
  remarks: string;
  company: string;
}

const empty: Draft = {
  name: '',
  phone: '',
  email: '',
  guests: '2',
  roomNumber: '',
  date: '',
  diningSession: 'dinner',
  time: '',
  seating: '',
  remarks: '',
  company: '',
};

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay();
}

function SeatIcon({ id }: { id: string }) {
  const props = { width: 32, height: 32, viewBox: '0 0 36 36', fill: 'none', 'aria-hidden': true as const };
  if (id === 'window') {
    return (
      <svg {...props}>
        <rect x="7" y="6" width="22" height="24" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M18 6v24M7 18h22" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (id === 'quiet') {
    return (
      <svg {...props}>
        <path d="M8 26V14l10-6 10 6v12" stroke="currentColor" strokeWidth="1.4" />
        <path d="M14 26v-7h8v7" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (id === 'group') {
    return (
      <svg {...props}>
        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="24" cy="13" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 26c1.2-4 3.4-6 6-6s4.8 2 6 6M18 26c1.2-4 3.4-6 6-6s4.8 2 6 6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (id === 'none') {
    return (
      <svg {...props}>
        <circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <rect x="6" y="14" width="24" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const sessionLabel: Record<DiningSession, string> = { breakfast: 'Breakfast', dinner: 'Dinner' };

export default function ReservationFlow() {
  const [step, setStep] = useState<1 | 2 | 'done'>(1);
  const [draft, setDraft] = useState<Draft>(empty);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [received, setReceived] = useState<{
    id: string;
    name: string;
    date: string;
    diningSession: DiningSession;
    time: string;
    guests: number;
    seating: string;
  } | null>(null);
  const today = useMemo(todayISO, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event')?.trim();
    const eventDate = params.get('date')?.trim();
    if (!eventName && !eventDate) return;
    setDraft((current) => ({
      ...current,
      date: eventDate && eventDate >= today ? eventDate : current.date,
      remarks: eventName
        ? `Reservation for event: ${eventName}${eventDate ? ` (${eventDate})` : ''}${current.remarks ? `\n${current.remarks}` : ''}`
        : current.remarks,
    }));
  }, [today]);
  const seating = SEATING_PREFERENCES.find((item) => item.id === draft.seating);
  const times = useMemo(() => {
    const base = [...slotsForSession(draft.diningSession)];
    if (draft.diningSession !== 'breakfast' || !draft.date) return base;
    const day = weekday(draft.date);
    const weekend = day === 0 || day === 6;
    if (weekend) return base.filter((slot) => slot >= '08:00' && slot <= '10:30');
    return base.filter((slot) => slot >= '07:30' && slot <= '10:00');
  }, [draft.diningSession, draft.date]);

  const set = (key: keyof Draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  function validateVisit() {
    if (draft.name.trim().length < 2) return 'Add the name for the booking.';
    if (draft.phone.trim().length < 6) return 'Add a phone number we can reach you on.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return 'Add a valid email address.';
    const guests = Number(draft.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 20) return 'Tell us how many guests, from 1 to 20.';
    if (!draft.date) return 'Choose a date.';
    if (draft.date < today) return 'That date has already passed.';
    if (!draft.time) return 'Choose a time.';
    if (!times.includes(draft.time)) return 'Choose one of the available times.';
    return '';
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    if (!draft.seating) {
      setError('Choose a seating preference.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, guests: Number(draft.guests) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We could not send that request.');
      setReceived({
        id: data.reservation?.id ?? '',
        name: draft.name,
        date: draft.date,
        diningSession: draft.diningSession,
        time: draft.time,
        guests: Number(draft.guests),
        seating: draft.seating,
      });
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send that request.');
    } finally {
      setSending(false);
    }
  }

  if (step === 'done' && received) {
    const seat = SEATING_PREFERENCES.find((item) => item.id === received.seating)?.label ?? received.seating;
    return (
      <section className="received" aria-live="polite">
        <p className="eyebrow eyebrow--terra">Reservation request received</p>
        <h2 className="h2">Reservation request received</h2>
        <p>Status: Awaiting confirmation. Our team will check availability and confirm shortly.</p>
        <dl className="visit-summary">
          <div><dt>Name</dt><dd>{received.name}</dd></div>
          <div><dt>Date</dt><dd>{received.date}</dd></div>
          <div><dt>Session</dt><dd>{sessionLabel[received.diningSession]}</dd></div>
          <div><dt>Time</dt><dd>{received.time}</dd></div>
          <div><dt>Guests</dt><dd>{received.guests}</dd></div>
          <div><dt>Seating</dt><dd>{seat}</dd></div>
        </dl>
        <p className="status-pill">Awaiting confirmation</p>
        {received.id && <p className="visit__note">Reference {received.id}</p>}
      </section>
    );
  }

  return (
    <form className="visit" onSubmit={submit} noValidate>
      {step === 1 ? (
        <>
          <header className="visit__head">
            <h2 className="h2">Reserve your table</h2>
            <p>Tell us when you&apos;re joining us and how we can reach you.</p>
          </header>
          <div className="visit__grid">
            <label className="field">
              <span>Name *</span>
              <input value={draft.name} onChange={(event) => set('name', event.target.value)} autoComplete="name" required />
            </label>
            <label className="field">
              <span>Phone number *</span>
              <input value={draft.phone} onChange={(event) => set('phone', event.target.value)} autoComplete="tel" inputMode="tel" required />
            </label>
            <label className="field">
              <span>Email *</span>
              <input value={draft.email} onChange={(event) => set('email', event.target.value)} autoComplete="email" inputMode="email" required />
            </label>
            <label className="field">
              <span>Number of guests *</span>
              <input value={draft.guests} onChange={(event) => set('guests', event.target.value)} inputMode="numeric" min={1} max={20} required />
            </label>
            <label className="field">
              <span>Room number</span>
              <input value={draft.roomNumber} onChange={(event) => set('roomNumber', event.target.value)} autoComplete="off" />
            </label>
            <label className="field">
              <span>Date *</span>
              <input type="date" value={draft.date} min={today} onChange={(event) => set('date', event.target.value)} required />
            </label>
            <fieldset className="field field--full session-toggle">
              <legend className="visit__label">Dining session *</legend>
              <div className="session">
                {(['breakfast', 'dinner'] as const).map((session) => (
                  <button
                    key={session}
                    type="button"
                    className={draft.diningSession === session ? 'is-on' : ''}
                    aria-pressed={draft.diningSession === session}
                    onClick={() => {
                      set('diningSession', session);
                      set('time', '');
                    }}
                  >
                    {sessionLabel[session]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="field field--full">
              <legend className="visit__label">Time *</legend>
              <div className="times" role="list">
                {times.map((time) => (
                  <button key={time} type="button" className={draft.time === time ? 'is-on' : ''} aria-pressed={draft.time === time} onClick={() => set('time', time)}>
                    {time}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          {error && <p className="visit__error" role="alert">{error}</p>}
          <div className="visit__actions">
            <button
              className="btn"
              type="button"
              onClick={() => {
                const message = validateVisit();
                setError(message);
                if (!message) setStep(2);
              }}
            >
              Continue <span className="arrow">→</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <header className="visit__head">
            <h2 className="h2">Any preferences?</h2>
          </header>
          <div className="seats seats--compact">
            {SEATING_PREFERENCES.map((option) => (
              <button key={option.id} type="button" className={`seat ${draft.seating === option.id ? 'is-on' : ''}`} aria-pressed={draft.seating === option.id} onClick={() => set('seating', option.id)}>
                <SeatIcon id={option.id} />
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>
          <label className="field">
            <span>Special requests / remarks</span>
            <textarea
              value={draft.remarks}
              onChange={(event) => set('remarks', event.target.value)}
              placeholder="Allergies, dietary requirements, celebrations or anything else we should know."
            />
          </label>
          <div>
            <p className="visit__label">Booking summary</p>
            <dl className="visit-summary">
              <div><dt>Name</dt><dd>{draft.name || '—'}</dd></div>
              <div><dt>Guests</dt><dd>{draft.guests || '—'}</dd></div>
              <div><dt>Date</dt><dd>{draft.date || '—'}</dd></div>
              <div><dt>Session</dt><dd>{sessionLabel[draft.diningSession]}</dd></div>
              <div><dt>Time</dt><dd>{draft.time || '—'}</dd></div>
              {draft.roomNumber && <div><dt>Room number</dt><dd>{draft.roomNumber}</dd></div>}
              <div><dt>Seating</dt><dd>{seating?.label ?? '—'}</dd></div>
            </dl>
          </div>
          {error && <p className="visit__error" role="alert">{error}</p>}
          <div className="visit__actions">
            <button className="btn btn--ghost" type="button" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn--terra" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send Reservation Request'} <span className="arrow">→</span>
            </button>
          </div>
        </>
      )}
      <input className="hp" tabIndex={-1} autoComplete="off" value={draft.company} onChange={(event) => set('company', event.target.value)} aria-hidden="true" />
    </form>
  );
}

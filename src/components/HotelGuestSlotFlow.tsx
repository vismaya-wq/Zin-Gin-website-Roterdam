import { useState, type FormEvent } from 'react';
import { DINNER_SLOTS, HOTEL_FLOORS, SEATING_PREFERENCES, type SeatingId } from '../data/hotel';
import { submitHotelSlotBooking } from '../lib/api';

type DateChoice = 'tonight' | 'tomorrow' | 'custom';

const STEP_LABELS = ['Room', 'Date', 'Time', 'Guests', 'Seating', 'Details'];
const MIN_GUESTS = 1;
const MAX_GUESTS = 12;

const toIso = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};
const pretty = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export default function HotelGuestSlotFlow() {
  const [step, setStep] = useState(0);
  const [floor, setFloor] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [dateChoice, setDateChoice] = useState<DateChoice | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [seating, setSeating] = useState<SeatingId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ reference: string } | null>(null);

  const dateIso =
    dateChoice === 'tonight'
      ? toIso(new Date())
      : dateChoice === 'tomorrow'
        ? toIso(addDays(1))
        : customDate;
  const dateLabel =
    dateChoice === 'tonight'
      ? 'Tonight'
      : dateChoice === 'tomorrow'
        ? 'Tomorrow'
        : customDate
          ? pretty(customDate)
          : '';

  const seatingLabel = SEATING_PREFERENCES.find((s) => s.id === seating)?.label ?? '';

  const summary = [
    floor && roomNumber ? { label: `${floor} · Room ${roomNumber}`, step: 0 } : null,
    dateLabel ? { label: dateLabel, step: 1 } : null,
    time ? { label: time, step: 2 } : null,
    step > 3 ? { label: `${guests} guests`, step: 3 } : null,
    seating ? { label: seatingLabel, step: 4 } : null,
  ].filter(Boolean) as { label: string; step: number }[];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const result = await submitHotelSlotBooking({
        floor: floor!,
        roomNumber,
        date: dateIso,
        time: time!,
        guests,
        seatingPreference: seating!,
        name: String(data.get('name')),
        phone: String(data.get('phone')),
        email: String(data.get('email') || '') || undefined,
        specialRequest: String(data.get('special') || '') || undefined,
      });
      setConfirmed({ reference: result.reference });
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="flow flow--done step-in" aria-live="polite">
        <p className="status-pill status-pill--pending">Booking request sent</p>
        <p className="eyebrow eyebrow--plain eyebrow--terra">Reference · {confirmed.reference}</p>
        <h3 className="h2">Awaiting manager confirmation</h3>
        <p className="flow__lede">
          Your dining request has been sent to our restaurant team.
          <br />
          We&apos;ll confirm your table and time shortly.
        </p>
        <ul className="flow__summary flow__summary--done">
          <li>{floor} · Room {roomNumber}</li>
          <li>{dateLabel}</li>
          <li>{time}</li>
          <li>{guests} guests</li>
          <li>{seatingLabel}</li>
        </ul>
        <p className="flow__manager-note">
          This is a request only — your table is confirmed once the manager accepts it. They may suggest another
          time or seating area if needed.
        </p>
      </div>
    );
  }

  return (
    <div className="flow flow--hotel">
      <header className="flow__intro">
        <p className="eyebrow">Hotel guest slot booking</p>
        <h2 className="h2">Staying with us?</h2>
        <p className="flow__lede">Book your dining slot directly from your hotel room.</p>
      </header>

      <div className="flow__progress" aria-hidden="true">
        {STEP_LABELS.map((label, index) => (
          <span key={label} className={index <= step ? 'is-on' : ''}>
            <b>0{index + 1}</b> {label}
          </span>
        ))}
      </div>

      {summary.length > 0 && (
        <ul className="flow__summary" aria-label="Your request so far">
          {summary.map((chip) => (
            <li key={chip.step}>
              <button type="button" onClick={() => setStep(chip.step)} aria-label={`Change ${chip.label}`}>
                {chip.label} <span aria-hidden="true">✎</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flow__stage" key={step}>
        <p className="flow__count">Step 0{step + 1} / 06</p>

        {step === 0 && (
          <fieldset className="flow__step step-in">
            <legend className="h2">Where are you staying?</legend>
            <label className="field">
              <span>Hotel floor</span>
              <select
                value={floor ?? ''}
                onChange={(e) => setFloor(e.target.value)}
                required
              >
                <option value="" disabled>Select floor</option>
                {HOTEL_FLOORS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Room number</span>
              <input
                name="room"
                inputMode="numeric"
                placeholder="e.g. 507"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />
            </label>
            <button
              type="button"
              className="btn"
              disabled={!floor || !roomNumber.trim()}
              onClick={() => setStep(1)}
            >
              Continue <span className="arrow">→</span>
            </button>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="flow__step step-in">
            <legend className="h2">When would you like to dine?</legend>
            <div className="choice-list">
              {(
                [
                  ['tonight', 'Tonight', pretty(toIso(new Date()))],
                  ['tomorrow', 'Tomorrow', pretty(toIso(addDays(1)))],
                  ['custom', 'Choose another date', 'Plan ahead'],
                ] as const
              ).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  className={`choice ${dateChoice === value ? 'is-selected' : ''}`}
                  aria-pressed={dateChoice === value}
                  onClick={() => {
                    setDateChoice(value);
                    if (value !== 'custom') setTimeout(() => setStep(2), 260);
                  }}
                >
                  <span className="choice__label">{label}</span>
                  <span className="choice__hint">{hint}</span>
                  <span className="choice__arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
            {dateChoice === 'custom' && (
              <div className="flow__custom step-in">
                <label className="field">
                  <span>Pick a date</span>
                  <input
                    type="date"
                    min={toIso(new Date())}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </label>
                <button type="button" className="btn" disabled={!customDate} onClick={() => setStep(2)}>
                  Continue <span className="arrow">→</span>
                </button>
              </div>
            )}
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="flow__step step-in">
            <legend className="h2">Choose your preferred time.</legend>
            <div className="time-grid time-grid--6">
              {DINNER_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`time ${time === slot ? 'is-selected' : ''}`}
                  aria-pressed={time === slot}
                  onClick={() => {
                    setTime(slot);
                    setTimeout(() => setStep(3), 260);
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="flow__step step-in">
            <legend className="h2">How many guests?</legend>
            <div className="guests">
              <button
                type="button"
                onClick={() => setGuests((n) => Math.max(MIN_GUESTS, n - 1))}
                disabled={guests <= MIN_GUESTS}
                aria-label="One guest fewer"
              >
                −
              </button>
              <output aria-live="polite">
                <span key={guests}>{guests}</span>
                <small>{guests === 1 ? 'guest' : 'guests'}</small>
              </output>
              <button
                type="button"
                onClick={() => setGuests((n) => Math.min(MAX_GUESTS, n + 1))}
                disabled={guests >= MAX_GUESTS}
                aria-label="One guest more"
              >
                +
              </button>
            </div>
            <button type="button" className="btn" onClick={() => setStep(4)}>
              Continue <span className="arrow">→</span>
            </button>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="flow__step step-in">
            <legend className="h2">Choose your preferred seating.</legend>
            <p className="flow__hint">
              This is a request — the manager will confirm availability for your preferred area.
            </p>
            <div className="seating-grid" data-floor-plan-ready>
              {SEATING_PREFERENCES.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  className={`seating-zone ${seating === zone.id ? 'is-selected' : ''}`}
                  data-seating-zone={zone.id}
                  aria-pressed={seating === zone.id}
                  onClick={() => setSeating(zone.id)}
                >
                  <span className="seating-zone__label">{zone.label}</span>
                  <span className="seating-zone__desc">{zone.description}</span>
                </button>
              ))}
            </div>
            <div className="floor-plan-placeholder" aria-hidden="true">
              <span>Interactive floor plan</span>
              <small>Layout map can be connected here later.</small>
            </div>
            <button type="button" className="btn" disabled={!seating} onClick={() => setStep(5)}>
              Continue <span className="arrow">→</span>
            </button>
          </fieldset>
        )}

        {step === 5 && (
          <form className="flow__step step-in" onSubmit={submit}>
            <h3 className="h2">Guest details</h3>
            <div className="form form--grid">
              <label className="field">
                <span>Guest name</span>
                <input name="name" autoComplete="name" required />
              </label>
              <label className="field">
                <span>Phone number</span>
                <input name="phone" type="tel" autoComplete="tel" required />
              </label>
              <label className="field field--wide">
                <span>Email — optional</span>
                <input name="email" type="email" autoComplete="email" />
              </label>
              <label className="field field--wide">
                <span>Special request</span>
                <textarea name="special" rows={3} placeholder="Allergies, celebration, accessibility…" />
              </label>
            </div>
            <button type="submit" className="btn btn--terra flow__submit" disabled={submitting}>
              {submitting ? 'Sending your request…' : (
                <>
                  Request My Slot <span className="arrow">→</span>
                </>
              )}
            </button>
            <p className="form__note">Your booking will be confirmed by the manager.</p>
          </form>
        )}

        {step > 0 && (
          <button type="button" className="flow__back" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
